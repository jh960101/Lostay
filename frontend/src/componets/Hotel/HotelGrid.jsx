import React from 'react'

import { FaStar } from "react-icons/fa6";
import { Link } from 'react-router-dom';

export default function HotelGrid(props) {
    return (
        <div className='hotel--grid--container'>
            <div className='HotelGrid'>

                {props.hotels.map((hotel) => (
                    <div className='HotelRow' key={hotel.id}>
                        <div className='HotelCol'>
                            <Link className='link_to_roomList' to={`../roomList/${hotel.hotelNo}/${props.check_in}/${props.check_out}/${props.member}`} >
                                <img src={'../' + hotel.hotelThumbnail} alt='호텔이미지' className='HotelImg' />
                            </Link>

                            <div className='HotelInfo'>
                                <div className='HotelRank'>{hotel.hotelRating}</div>
                                <Link className='link_to_roomList' to={`../roomList/${hotel.hotelNo}/${props.check_in}/${props.check_out}/${props.member}`} >
                                <div className='HotelName'>{hotel.hotelName}</div>
                                </Link>
                                <div className='StarDiv'>
                                    <div className='Star'>
                                        <FaStar className='StarIcon' />
                                        <div className='StarNum'>{hotel.reviewRating?.toFixed(1)}</div>
                                    </div>
                                    <span className='StarCount'>{hotel.totalReviewCount}명 평가</span>
                                </div>
                            </div>
                            <div className='HotelPrice'>
                                {hotel.roomDiscount > 0 ? (
                                    <>
                                        <div className='RealPrice'>{hotel.roomPrice.toLocaleString()}원</div>
                                        <div className='HotelDiscount'>
                                            <div className='Discount'>{hotel.roomDiscount}%</div>
                                            <div className='DiscountPrice'>{hotel.roomDcPrice.toLocaleString()}원</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='HotelDiscount'>
                                            <div className='Discount' style={{ visibility: 'hidden' }}>{hotel.roomDiscount}%</div>
                                            <div className='DiscountPrice'>{hotel.roomDcPrice.toLocaleString()}원</div>
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>
                        <div className='RowLine'></div>
                    </div>
                ))}
            </div>
        </div>
    )
}
