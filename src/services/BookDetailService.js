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
                libName: lib.libName || `Unnamed Library ${index}`,
                latitude: parseFloat(lib.latitude) || null,
                longitude: parseFloat(lib.longitude) || null,
                address: lib.address || '주소 없음',
                operatingTime: lib.operatingTime || '운영 시간 정보 없음',
                homepage: lib.homepage || '',
                tel: lib.tel || '',
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

// 카카오 지도 초기화
export const initializeKakaoMap = (mapContainerId, onError) => {
    if (!window.kakao || !window.kakao.maps) {
        onError('Kakao Map script not loaded.');
        return null;
    }

    const mapContainer = document.getElementById(mapContainerId);
    const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심 좌표
        level: 3,
    };

    const map = new kakao.maps.Map(mapContainer, options);
    return map;
};

// 사용자 위치 마커 추가
export const addUserMarker = (map, onError) => {
    if (!navigator.geolocation) {
        onError('Geolocation is not supported by this browser.');
        return null;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const userCoords = new kakao.maps.LatLng(latitude, longitude);

            const marker = new kakao.maps.Marker({
                map,
                position: userCoords,
            });

            const infoWindow = new kakao.maps.InfoWindow({
                content: '<div style="padding:5px;">현재 위치</div>',
            });

            infoWindow.open(map, marker);
            map.setCenter(userCoords);

            return userCoords;
        },
        (error) => {
            console.error('Error fetching user location:', error);
            onError('Failed to fetch user location.');
        }
    );
};

// 도서관 마커 추가
export const addLibraryMarkers = (map, libraries) => {
    if (!map || libraries.length === 0) return;

    libraries.forEach((library) => {
        const { latitude, longitude, libName } = library;

        if (!latitude || !longitude) {
            console.error(`Invalid coordinates for library: ${libName}`);
            return;
        }

        const coords = new kakao.maps.LatLng(latitude, longitude);

        const marker = new kakao.maps.Marker({
            map: map,
            position: coords,
        });

        const infoWindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;">${libName}</div>`,
        });

        kakao.maps.event.addListener(marker, 'click', () => {
            infoWindow.open(map, marker);
        });
    });
};
