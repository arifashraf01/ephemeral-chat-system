package com.arif.chatapp.repository;

import com.arif.chatapp.model.ChatRequest;
import com.arif.chatapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRequestRepository extends JpaRepository<ChatRequest, Long> {

	Optional<ChatRequest> findBySenderAndReceiver(User sender, User receiver);

	boolean existsBySenderAndReceiverOrSenderAndReceiver(
			User sender,
			User receiver,
			User reverseSender,
			User reverseReceiver
	);

	List<ChatRequest> findByReceiver(User receiver);
}
