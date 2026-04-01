package com.arif.chatapp.repository;

import com.arif.chatapp.model.Chat;
import com.arif.chatapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    List<Chat> findByUser1OrUser2(User user1, User user2);

    boolean existsByUser1AndUser2OrUser1AndUser2(
            User user1,
            User user2,
            User reverseUser1,
            User reverseUser2
    );
}
