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
}
