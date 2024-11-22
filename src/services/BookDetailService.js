import axios from 'axios';

let isFetching = false; // API 호출 상태 추적

// 도서관 리스트 가져오기
export const getLibraries = async (isbn13, region = 11) => {

    if (isFetching) return [];
    isFetching = true;

    try {
        const response = await axios.get('http://localhost:8081/api/libraries', {
            params: { isbn: isbn13, region },
        });

        isFetching = false;
        const libs = response.data?.libs || [];

        // 데이터 추출 및 검증
        const validatedLibraries = libs.map((libWrapper, index) => {
            const lib = libWrapper.lib;

            if (!lib) {
                console.error(`Missing lib object at index ${index}`);
                return null;
            }

            return {
                libCode: lib.libCode,
                libName: lib.libName || `Unnamed Library ${index}`,
                latitude: parseFloat(lib.latitude) || null,
                longitude: parseFloat(lib.longitude) || null,
                address: lib.address || '주소 없음',
                operatingTime: lib.operatingTime || '운영 시간 정보 없음',
                homepage: lib.homepage || '',
                tel: lib.tel || '',
                buttonVisible: true, // 버튼 표시 여부
                loanStatus: null, // 대출 상태 초기화
            };
        }).filter(Boolean); // `null` 값 제거

        return validatedLibraries;
    } catch (error) {
        isFetching = false;
        console.error('Error fetching libraries:', error.message);
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
            console.error('Error Status Code:', error.response.status);
        }
        throw new Error('Could not fetch library information');
    }
};

//대출 확인 api
export const checkBookExist = async (isbn13, libCode) => {
    if (!isbn13 || !libCode) {
        console.error('Missing parameters: isbn13 or libCode');
        throw new Error('Missing parameters for book existence check');
    }

    try {
        const response = await axios.get('http://localhost:8080/api/book/exist', {
            params: { isbn13, libCode },
        });

        // 응답 데이터 검증 및 반환
        if (response?.data?.response?.result) {
            return response.data.response.result;
        } else {
            console.error('Malformed API response:', response.data);
            throw new Error('Malformed API response');
        }
    } catch (error) {
        console.error('Error checking book existence:', error);
        throw error;
    }
};

// 카카오 지도 초기화
let cachedMap = null; // 캐싱된 지도 객체

export const initializeKakaoMap = (mapContainerId, onError, options = null) => {
    if (!window.kakao || !window.kakao.maps) {
        onError('Kakao Map script not loaded.');
        return null;
    }

    const mapContainer = document.getElementById(mapContainerId);

    if (!mapContainer) {
        onError('Map container not found.');
        return null;
    }

    const mapOptions = options || {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심 좌표
        level: 4, // 기본 줌 레벨
    };

    const map = new kakao.maps.Map(mapContainer, mapOptions);

    // 캐싱
    cachedMap = map;

    return map;
};

//
export const clearKakaoMap = (mapContainerId) => {
    const mapContainer = document.getElementById(mapContainerId);
    if (mapContainer) {
        Array.from(mapContainer.children).forEach((child) => {
            if (child.id !== 'sidebar') {
                child.remove(); // 지도만 삭제하고 사이드바는 유지
            }
        });
    }
};

// 도서관 좌표로 지도 이동
export const moveToLibrary = (map, latitude, longitude) => {
    if (map && latitude && longitude) {
        const newCenter = new kakao.maps.LatLng(latitude, longitude);
        map.setCenter(newCenter); // 지도 중심 이동
    } else {
        console.error('Invalid map or coordinates.');
    }
};

// 사용자 위치
export const addUserMarker = (map, onError) => {
    if (!navigator.geolocation) {
        onError('Geolocation is not supported by this browser.');
        return null;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const userCoords = new kakao.maps.LatLng(latitude, longitude);

            // 사용자 지정 마커 이미지
            const imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
            const imageSize = new kakao.maps.Size(24, 35); // 이미지 크기
            const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

            const marker = new kakao.maps.Marker({
                map,
                position: userCoords,
                image: markerImage,
            });

            // CustomOverlay 생성
            const content = `
                <div style="font-size: 9.5pt; background-color: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 10px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
                    <strong>현재 위치</strong>
                </div>
            `;
            const overlay = new kakao.maps.CustomOverlay({
                map,
                position: userCoords,
                content: content,
                yAnchor: -.25, // 위치 보정
            });

            overlay.setMap(null);

            kakao.maps.event.addListener(marker, 'mouseover', () => {
                overlay.setMap(map); // 마우스오버 시 CustomOverlay 표시
            });

            kakao.maps.event.addListener(marker, 'mouseout', () => {
                overlay.setMap(null); // 마우스아웃 시 CustomOverlay 숨김
            });

            map.setCenter(userCoords);

            return userCoords;
        },
        (error) => {
            console.error('Error fetching user location:', error);
            onError('Failed to fetch user location.');
        }
    );
};

// 도서관 마커 표시
export const addLibraryMarkers = (map, libraries) => {
    if (!map || libraries.length === 0) return;

    libraries.forEach((library) => {
        const { latitude, longitude, libName, address, operatingTime } = library;

        if (!latitude || !longitude) {
            console.error(`Invalid coordinates for library: ${libName}`);
            return;
        }

        const coords = new kakao.maps.LatLng(latitude, longitude);

        // 마커 생성
        const marker = new kakao.maps.Marker({
            map,
            position: coords,
        });

        // CustomOverlay
        const content = document.createElement('div');
        content.className = 'wrap';
        content.innerHTML = `
            <div class="info">
                <div class="title">
                    ${libName}
                    <div class="close" title="닫기"></div>
                </div>
                <div class="body">
                    <div class="desc">
                        <div class="ellipsis">주소 : ${address}</div>
                        <div class="ellipsis">운영 시간 : ${operatingTime}</div>
                    </div>
                </div>
            </div>
        `;

        const overlay = new kakao.maps.CustomOverlay({
            content: content,
            map: null, // 초기에는 표시되지 않음
            position: coords,
        });

        // 닫기 버튼 클릭 이벤트
        const closeButton = content.querySelector('.close');
        closeButton.onclick = () => {
            overlay.setMap(null); // 오버레이 숨기기
        };

        // 마커 클릭 시 CustomOverlay 표시
        kakao.maps.event.addListener(marker, 'click', () => {
            overlay.setMap(map); // 오버레이 표시
        });
    });
};

// 좌표 간 거리 계산 (단위: m)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {

    const toRad = (value) => (value * Math.PI) / 180;

    if (
        isNaN(parseFloat(lat1)) ||
        isNaN(parseFloat(lon1)) ||
        isNaN(parseFloat(lat2)) ||
        isNaN(parseFloat(lon2))
    ) {
        console.warn('Invalid coordinates for distance calculation:', {
            lat1, lon1, lat2, lon2,
        });
        return Number.MAX_SAFE_INTEGER; // 거리 계산 불가 시 최대값 반환
    }

    const R = 6371000; // 지구 반지름 (m)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};