package com.lostay.backend.payment.controller;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Iterator;
import java.util.List;

import org.hibernate.annotations.Parameter;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lostay.backend.oauth2.service.CustomOAuth2User;
import com.lostay.backend.payment.dto.PaymentDTO;
import com.lostay.backend.payment.dto.PaymentVerificationDTO;
//import com.lostay.backend.payment.entity.Payment;
import com.lostay.backend.payment.repository.PaymentRepository;
import com.lostay.backend.payment.service.PaymentService;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class PaymentController {

	private IamportClient iamportClient;

    @Value("${imp.api.key}")
    private String apiKey;
    
    @Value("${imp.api.secretKey}")
    private String secretKey;
	
	
	@Autowired
	private PaymentService paySer;
	

	// 결제 내역
	@GetMapping("/PaymentHistory")
	public ResponseEntity<?> paymenthistory(@RequestParam(defaultValue = "3") Long payNo){

		
		return new ResponseEntity<>(paySer.findPayHistory(payNo),HttpStatus.OK);
	}
	
	
	// 결제 진행 페이지 호텔-객실(투숙) 정보 <결제정보에서 상품금액에서도 사용>
	@GetMapping("/HotelRoomInfo")
	public ResponseEntity<?> hotelroominfo(@AuthenticationPrincipal CustomOAuth2User customOAuth2User
										  ,@RequestParam(defaultValue = "1") Long roomNo
										  ,@RequestParam(defaultValue = "2024-10-15") 
    									   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate
    									  ,@RequestParam(defaultValue = "2024-10-20") 
										   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate){
			
		
		
		return new ResponseEntity<>(paySer.findRoomInfo(roomNo,checkInDate,checkOutDate),HttpStatus.OK);
			
	}
	
	
	// 결제 진행 페이지 유저 정보 <결제정보에서 보유 포인트에서도 사용>
		@GetMapping("/UserInfo")
		public ResponseEntity<?> userinfo(@AuthenticationPrincipal CustomOAuth2User customOAuth2User){
				
			Long userNo = customOAuth2User.getUserNo();
			
			return new ResponseEntity<>(paySer.findUserInfo(userNo),HttpStatus.OK);
				
		}
	
	
		
	// 사전검증
	@PostMapping("/Payment/Before")
	private ResponseEntity<?> paymentbefore(@AuthenticationPrincipal CustomOAuth2User customOAuth2User
			                               ,@RequestParam() int point
			                               ,@RequestParam() Long roomNo
			                               ,@RequestParam() Long disNo
			                               ,@RequestParam() String merchant_uid) throws IOException, InterruptedException{
		
	  long userNo = customOAuth2User.getUserNo();
		
	  int amount = paySer.compareAmount(userNo,point,roomNo,disNo);
	  
	
		HttpRequest request = HttpRequest.newBuilder()
			    .uri(URI.create("https://api.iamport.kr/users/getToken"))
			    .header("Content-Type", "application/json")
			    .method("POST", HttpRequest.BodyPublishers.ofString(String.format("{\"imp_key\":\"%s\",\"imp_secret\":\"%s\"}", apiKey, secretKey)))
			    .build();
			HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
			
	      
	        JSONObject jsonResponse = new JSONObject(response.body());
	        
	        // jsonObject에서 response 안에 있는 access토큰 문자열로 받아오기
	        String accessToken = jsonResponse.getJSONObject("response").getString("access_token");

	        
	        // 사전검증 api
	        HttpRequest request2 = HttpRequest.newBuilder()
	        	    .uri(URI.create("https://api.iamport.kr/payments/prepare"))
	        	    .header("Content-Type", "application/json")
	        	    .header("Authorization", "Bearer " + accessToken)
	        	    .method("POST", HttpRequest.BodyPublishers.ofString(String.format("{\"merchant_uid\":\"%s\",\"amount\":%d}", merchant_uid, amount)))
	        	    .build();
	        	HttpResponse<String> response2 = HttpClient.newHttpClient().send(request2, HttpResponse.BodyHandlers.ofString());
	        
	        
		
		return  new ResponseEntity<>(response2,HttpStatus.OK);
	}
		
		
	// 사후검증	
	@PostMapping("/Payment/Verification")
	  private IamportResponse<Payment> paymentByImpUid(@RequestBody PaymentVerificationDTO payDTO) throws IamportResponseException,IOException {
		 iamportClient = new IamportClient(apiKey, secretKey);
		
		 System.out.println(payDTO);
        return iamportClient.paymentByImpUid(payDTO.getImp_uid());
    }
	
	
	// 사후검증 완료 시 결제 테이블 데이터 삽입
	@PostMapping("/PaymentInsert")
	public void paymentinsert(@AuthenticationPrincipal CustomOAuth2User customOAuth2User
							 ,@RequestBody PaymentDTO dto){

//		Long userNo = customOAuth2User.getUserNo();
		Long userNo = 1L;
		paySer.savePayment(userNo,dto);
		
	}
	
	
	// 결제 취소
	@GetMapping("/PaymentCancle")
	public void paymentcancle(@RequestParam(defaultValue = "2") Long payNo,@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {
		
		Long userNo = 1L;
	
		// 결제 취소 api 아직 안들어옴
		
		paySer.canclePayment(payNo,userNo);
		
	}
	

}
