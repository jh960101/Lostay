package com.lostay.backend.cart.entity;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

import javax.persistence.*;

import com.lostay.backend.hotel.entity.Hotel;
import com.lostay.backend.user.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Cart {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "cart_no")
	private Long cartNo; // 찜넘버

	@ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "userNo", nullable = false) // 외래키 설정
	@JsonManagedReference // Cart에서 User 방향
	private User user; // 회원넘버

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY) // 변경: CascadeType 조정
	@JoinTable(name = "cart_hotel", // 중간 테이블 이름
			joinColumns = @JoinColumn(name = "cartNo"), // Cart의 외래키
			inverseJoinColumns = @JoinColumn(name = "hotelNo") // Hotel의 외래키
	) // 외래키 설
	// private Set<Hotel> hotels; // 호텔넘버
	@JsonBackReference // Hotel에서 Cart 방향
	private Set<Hotel> hotels = new HashSet<>(); // 호텔넘버 초기화
	
	 // Cart 삭제 시 관련된 호텔의 카트 목록에서 제거
    public void removeHotels() {
        for (Hotel hotel : hotels) {
            hotel.getCarts().remove(this); // Hotel의 카트 목록에서 제거
        }
        hotels.clear(); // 카트에서 호텔 목록을 비움
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(cartNo); // cartNo로만 해시코드 계산
    }
	
}
