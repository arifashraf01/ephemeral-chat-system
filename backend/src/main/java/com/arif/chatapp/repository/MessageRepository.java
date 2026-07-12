package com.arif.chatapp.repository;

import com.arif.chatapp.model.Message;
import com.arif.chatapp.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

	List<Message> findBySenderAndReceiver(User sender, User receiver);

	List<Message> findBySenderAndReceiverOrSenderAndReceiverOrderByTimestampAsc(
			User sender,
			User receiver,
			User reverseSender,
			User reverseReceiver
	);

	@Query("SELECT m FROM Message m WHERE (m.sender = :user AND m.receiver = :partner AND m.deletedForSender = false) OR (m.sender = :partner AND m.receiver = :user AND m.deletedForReceiver = false) ORDER BY m.timestamp DESC")
	Page<Message> findConversation(
			@Param("user") User user,
			@Param("partner") User partner,
			Pageable pageable
	);

	@Modifying
	@Query("UPDATE Message m SET m.deletedForSender = true WHERE m.sender = :user AND m.receiver = :partner")
	void softDeleteForSender(@Param("user") User user, @Param("partner") User partner);

	@Modifying
	@Query("UPDATE Message m SET m.deletedForReceiver = true WHERE m.receiver = :user AND m.sender = :partner")
	void softDeleteForReceiver(@Param("user") User user, @Param("partner") User partner);
}
