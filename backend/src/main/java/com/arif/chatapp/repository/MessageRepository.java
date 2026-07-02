package com.arif.chatapp.repository;

import com.arif.chatapp.model.Message;
import com.arif.chatapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

	List<Message> findBySenderAndReceiver(User sender, User receiver);

	List<Message> findBySenderAndReceiverOrSenderAndReceiverOrderByTimestampAsc(
			User sender,
			User receiver,
			User reverseSender,
			User reverseReceiver
	);

	org.springframework.data.domain.Page<Message> findBySenderAndReceiverOrSenderAndReceiverOrderByTimestampDesc(
			User sender,
			User receiver,
			User reverseSender,
			User reverseReceiver,
			org.springframework.data.domain.Pageable pageable
	);

	@org.springframework.data.jpa.repository.Modifying
	@org.springframework.data.jpa.repository.Query("UPDATE Message m SET m.deletedForSender = true WHERE m.sender = :user AND m.receiver = :partner")
	void softDeleteForSender(@org.springframework.data.repository.query.Param("user") User user, @org.springframework.data.repository.query.Param("partner") User partner);

	@org.springframework.data.jpa.repository.Modifying
	@org.springframework.data.jpa.repository.Query("UPDATE Message m SET m.deletedForReceiver = true WHERE m.receiver = :user AND m.sender = :partner")
	void softDeleteForReceiver(@org.springframework.data.repository.query.Param("user") User user, @org.springframework.data.repository.query.Param("partner") User partner);
}
