<template>
  <div class="kakao-map-container">
    <div class="map-header">
      <span class="map-icon">📍</span>
      <h3>기업 본사 주소/위치 안내</h3>
    </div>
    
    <div id="kakao-space-map" class="actual-map-box"></div>
    
    <div class="map-footer-info" v-if="currentAddress">
      <p class="address-text"><strong>검색된 위치:</strong> {{ currentAddress }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  companyName: {
    type: String,
    required: true,
    default: "한국거래소"
  }
});

const currentAddress = ref("");
let mapInstance = null;
let placesService = null;
let marker = null;

// 🗺️ 대한민국 대기업 진짜 본사 사옥 저격용 딕셔너리 (완벽 정합성 필터)
const corporateHQMap = {
  "삼성전자": "삼성전자 서초사옥",
  "삼전": "삼성전자 서초사옥",
  "SK하이닉스": "SK하이닉스 이천본사",
  "하이닉스": "SK하이닉스 이천본사",
  "현대자동차": "현대자동차 본사 양재사옥",
  "현대차": "현대자동차 본사 양재사옥",
  "네이버": "네이버 그린팩토리",
  "카카오": "카카오 판교아지트",
  "KB국민은행": "KB국민은행 신관",
  "국민은행": "KB국민은행 신관",
  "신한은행": "신한은행 본점",
  "우리은행": "우리은행 본점",
  "하나은행": "하나은행 본점"
};

function initAndSearchMap(targetName) {
  // 💡 중요: props에 의존하지 않고, watch나 마운트 시점에 유효성 검증을 거친 최신 이름을 아규먼트로 직접 수신
  const rawName = targetName || props.companyName;
  const queryCompany = (rawName || "").trim();
  
  // 1차 방어선: 데이터가 텅 비었거나 더미 텍스트면 종로 금거래소로 가는 카카오 오작동을 원천 차단
  if (!queryCompany || queryCompany === "해당 기업" || queryCompany === "주식 시장" || queryCompany === "주식시장") {
    currentAddress.value = "기사 연동 기업 위치 탐색 중...";
    return;
  }

  if (!window.kakao || !window.kakao.maps) return;

  const container = document.getElementById("kakao-space-map");
  if (!container) return;

  if (!mapInstance) {
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 초기 서울시청
      level: 3 // 본사 타워 위주로 가깝게 클로즈업
    };
    mapInstance = new window.kakao.maps.Map(container, options);
    placesService = new window.kakao.maps.services.Places();
  }

  // 2차 방어선: 딕셔너리에 등록된 명칭이 단어 일부라도 포함되면 무조건 '진짜 사옥 키워드'로 변환 보정
  let searchQuery = queryCompany;
  
  // 딕셔너리 키 매칭 순회
  for (const key in corporateHQMap) {
    if (queryCompany.includes(key)) {
      searchQuery = corporateHQMap[key];
      break;
    }
  }

  // 매핑된 단어가 없고 일반 중소기업일 경우에만 '본사' 접미사 안전 결합
  if (searchQuery === queryCompany && !searchQuery.includes("본사") && !searchQuery.includes("본점")) {
    searchQuery = `${searchQuery} 본사`;
  }

  console.log(`🗺️ [카카오 정밀 타겟 서칭] 최종 전송 키워드: "${searchQuery}"`);

  // 3. 카카오맵 장소 키워드 API 구동
  placesService.keywordSearch(searchQuery, function (data, status) {
    if (status === window.kakao.maps.services.Status.OK) {
      const targetPlace = data[0];
      const coords = new window.kakao.maps.LatLng(targetPlace.y, targetPlace.x);
      
      currentAddress.value = `${targetPlace.place_name} (${targetPlace.address_name})`;

      if (marker) marker.setMap(null);

      marker = new window.kakao.maps.Marker({
        map: mapInstance,
        position: coords
      });

      // 카메라 중심점을 해당 진짜 사옥으로 텔레포트
      mapInstance.panTo(coords);
    } else {
      // 3차 최종 보루선
      placesService.keywordSearch(queryCompany, function (fallbackData, fallbackStatus) {
        if (fallbackStatus === window.kakao.maps.services.Status.OK) {
          const targetPlace = fallbackData[0];
          const coords = new window.kakao.maps.LatLng(targetPlace.y, targetPlace.x);
          currentAddress.value = `${targetPlace.place_name} (${targetPlace.address_name})`;

          if (marker) marker.setMap(null);
          marker = new window.kakao.maps.Marker({ map: mapInstance, position: coords });
          mapInstance.panTo(coords);
        } else {
          currentAddress.value = `'${queryCompany}'의 정확한 본사 위치를 탐색하지 못했습니다.`;
        }
      });
    }
  });
}

// 💡 비동기 타이밍 어긋남을 완벽히 잡는 실시간 딥 와치 가이딩 파이프라인
watch(
  () => props.companyName,
  (newCompany) => {
    if (newCompany && newCompany !== "해당 기업" && newCompany !== "주식 시장" && newCompany.trim() !== "") {
      console.log("🔄 [지도 컴포넌트] 실시간 동적 주입명 갱신 캐치:", newCompany);
      // 부모로부터 새 데이터가 들어오면, 팅김 현상 없이 새 이름 아규먼트를 들고 함수 가동
      setTimeout(() => {
        initAndSearchMap(newCompany);
      }, 80);
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (window.kakao && window.kakao.maps) {
    initAndSearchMap(props.companyName);
  }
});
</script>

<style scoped>
.kakao-map-container { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.map-header { display: flex; align-items: center; gap: 6px; }
.map-header h3 { font-size: 13.5px; font-weight: 700; color: #475569; margin: 0; }
.map-icon { font-size: 14px; }
.actual-map-box { width: 100%; height: 280px; border-radius: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc; }
.map-footer-info { background: #f8fafc; padding: 10px 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
.address-text { font-size: 12.5px; color: #334155; margin: 0; text-align: left; line-height: 1.4; }
</style>