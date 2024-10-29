import React, { useEffect, useState } from 'react'
import { Button, Container } from 'react-bootstrap'
import { IoIosHeartEmpty } from "react-icons/io";
import { IoMdHeart } from "react-icons/io";
import { IoNavigate } from "react-icons/io5";
import { useParams } from 'react-router-dom';
import HotelCarousel from '../../componets/Hotel/HotelCarousel';
import HotelReview from '../../componets/Hotel/HotelReview';
import KakaoMap from '../../componets/Map/KakaoMap';
import RoomGrid from '../../componets/Room/RoomGrid';
import Footer from '../../componets/Footer/Footer';
import HotelService from '../../componets/Hotel/HotelService';
import HotelIntroduce from '../../componets/Hotel/HotelIntroduce';
import axios from 'axios';
import CompHeaderGeneral from '../../componets/Header/CompHeaderGeneral';
import CompSearchBox from '../../componets/Search/CompSearchBox';

export default function RoomList() {

  //////////////////////////////////////////////////////////////////////////////JIP1029
  //////////////////////////////////////////////////////////for default parameters
  const parameters = useParams();
  let check_in = new Date(parameters.checkIn);
  let check_out = new Date(parameters.checkOut);
  let member = parameters.member;
  //////////////////////////////////////////////////////////for default parameters
  //////////////////////////////////////////////////////////for hidden & focus
  // searchBox(Modal)이 열렸니?
  const [searchBoxShow, setSearchBoxShow] = useState(false);

  // 어디서 모달 불렀니?
  const functionFromWhere = (fromWhere) => {
    console.log('where are you?: ' + fromWhere);
  }

  // Header에서 어떤 input 눌렀니?
  const [focus, setFocus] = useState('input_place');
  // input(on header) 선택 위치에 따라 focus 변경 -> 하위 모달에 focus 전달 & 모달 열기
  const functionSearchPicker = (fromMyChild) => {
    console.log(fromMyChild + ' is picked at headerGeneral');
    setFocus(fromMyChild);
    setSearchBoxShow(true);
  }
  //////////////////////////////////////////////////////////for hidden & focus
  //////////////////////////////////////////////////////////////////////////////JIP1029


  const [RoomInfos, setRoomInfos] = useState({ list: [], dto: [] });  // 객실 정보를 저장할 state
  const [RoomReviews, setRoomReviews] = useState([]);  // 리뷰 정보를 저장할 state
  const [error, setError] = useState(null);        // 에러 핸들링을 위한 state
  const [loading, setLoading] = useState(true);    // 로딩 상태 관리

  // 날짜 형식 변경
  const convertToLocalDateTime = (dateString) => {
    const date = new Date(dateString);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};


  // 기본 파라미터
  const hotelNo = parameters.hotelNo;
  const checkInDate = convertToLocalDateTime(parameters.checkIn);
  const checkOutDate = convertToLocalDateTime(parameters.checkOut);
  const peopleMax = member;

  // 룸리스트 가져오기
  const fetchHotelRoomList = async () => {
    try {
      const response = await axios.get('http://localhost:9090/HotelRoomList', {
        params: { hotelNo, checkInDate, checkOutDate, peopleMax },
      });
      setRoomInfos(response.data);  // 성공 시 응답 데이터를 RoomInfos에 저장
    } catch (error) {
      setError(error);  // 오류가 발생한 경우 에러 저장
    } finally {
      setLoading(false);  // 로딩 상태 종료
    }
  };

  // 룸리스트 리뷰3개 가져오기
  const fetchHotelRoomListReview3 = async () => {
    try {
      const response = await axios.get('http://localhost:9090/InquireRoom3', {
        params: { hotelNo },
      });
      setRoomReviews(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelRoomList();
    fetchHotelRoomListReview3();
  }, []);


  const [showAll, setshowAll] = useState(false);

  const displayedRooms = showAll ? RoomInfos.list : RoomInfos.list.slice(0, 10);



  const handleFindButtonClick = () => {
    const encodedLocation = encodeURIComponent(RoomInfos.dto.hotelAdress); // 주소를 URL 인코딩
    window.location.href = `/HotelMap?location=${encodedLocation}`;
  };

  return (
    <Container className='room--list'>

      {/* header w/ searchParams JIP1029 */}
      <CompHeaderGeneral
        where={functionFromWhere}
        callParent={functionSearchPicker}
        place={RoomInfos.dto.hotelName}
        check_in={check_in}
        check_out={check_out}
        member={member}
      />

      {/* searchBox(Modal) JIP1029 */}
      {RoomInfos.dto.hotelName?.length > 0 && <CompSearchBox
        show={searchBoxShow}
        onHide={() => { setSearchBoxShow(false) }}
        place={RoomInfos.dto.hotelName}
        check_in={check_in}
        check_out={check_out}
        member={member}
        focus={focus}
      />}


      {RoomInfos.dto.hotelImage?.length > 0 && <HotelCarousel images={RoomInfos.dto.hotelImage} />}

      <div className='HotelInfo'>
        <div className='HotelRN'>
          <div className='HotelRank'>{RoomInfos.dto.hotelRating}</div>
          <div className='HotelName'>{RoomInfos.dto.hotelName}</div>
        </div>

        <IoIosHeartEmpty className='HeartIcon' />
      </div>

      <div className='RowLine'></div>

      <HotelReview Reviews={RoomReviews} HotelInfo={RoomInfos.dto} />


      <div className='HotelLocation'>
        <div className='LoTitle'>위치/길찾기</div>
        <span className='LoContent'>{RoomInfos.dto.hotelAdress}</span>
        <Button id='FindBtn' onClick={handleFindButtonClick}>길찾기<IoNavigate /></Button>

        {RoomInfos.dto.hotelAdress?.length > 0 && <KakaoMap Location={RoomInfos.dto.hotelAdress} />}
      </div>

      <div className='RLtitle'>객실선택</div>

      {displayedRooms.map((rooms, idx) => (
        <RoomGrid rooms={rooms} key={idx} />
      ))}

      {RoomInfos.list.length > 10 && !showAll && (
        <div onClick={() => setshowAll(true)} className='showAll'>객실 모두보기</div>
      )}

      <div className='RowLine'></div>

      <div className='IntroTitle'>숙소 소개</div>
      <HotelIntroduce introduce={RoomInfos.dto.hotelIntroduction} />

      <div className='RowLine'></div>

      <div className='ServiceTitle'>서비스 및 부대시설</div>
      {RoomInfos.dto.hotelAmenities?.length > 0 && <HotelService services={RoomInfos.dto.hotelAmenities} />}




      <Footer />
    </Container>


  )
}