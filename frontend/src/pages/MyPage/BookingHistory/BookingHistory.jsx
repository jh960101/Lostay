import React, { useState } from 'react'
import BackNav from '../../../componets/BackNav/BackNav';
import Navbar from '../../../componets/Navbar/Navbar';
import { Dropdown, Nav } from 'react-bootstrap';
export default function BookingHistory() {

    const dateList = ['최근 3개월', '최근 6개월', '최근 1년'];
    const tabList = ['예약한 숙소', '이용한 숙소', '취소한 숙소'];

    const [selectedDate, setSelectedDate] = useState(dateList[0]);
    const [activeTab, setActiveTab] = useState(0)
    const [borderStyle] = useState({ left: 0, width: 0 }); // 바닥선 스타일

    const handleSelect = (eventKey) => {
        setSelectedDate(dateList[eventKey]);
    };

    const handleSelectTab = (eventKey) => {
        setActiveTab(eventKey);
    };

    return (
        <div className='booking--history--container'>
            <div>
                <BackNav title='예약 내역' />
            </div>

            <div className='booking--history--wrap'>
                <div className='dropdown--box'>
                    <Dropdown onSelect={handleSelect} className='dropdown'>
                        <Dropdown.Toggle>
                            {selectedDate}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {dateList.map(
                                (dateVal, idx) => (

                                    <Dropdown.Item eventKey={idx}>{dateVal}</Dropdown.Item>

                                ),
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <div className='notify'>
                    <strong>예약 취소 요청</strong>은 체크인 하루전까지 가능합니다.
                </div>

                <div className='tab--wrap'>
                    <Nav fill variant="tabs" defaultActiveKey="/home">
                        {tabList.map((tabVal, idx) => (
                            <Nav.Item>
                                <Nav.Link
                                    eventKey={idx}
                                    active={activeTab === idx} // 선택된 탭에 active 속성 추가
                                    onClick={() => handleSelectTab(idx)} // 클릭 시 상태 변경
                                >
                                    {tabVal}
                                </Nav.Link>
                            </Nav.Item>
                        ),
                        )}
                        <div
                            className="border-slide"
                            style={{
                                left: borderStyle.left,
                                width: borderStyle.width,
                            }}
                        />
                    </Nav>
                </div>



                <div>
                    리스트
                </div>
            </div>

            <div>
                <Navbar />
            </div>
        </div>
    )
}
