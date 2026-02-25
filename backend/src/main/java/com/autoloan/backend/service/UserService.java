package com.autoloan.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autoloan.backend.dto.user.UserProfileResponse;
import com.autoloan.backend.dto.user.UserUpdateRequest;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.User;
import com.autoloan.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());

        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    private UserProfileResponse toProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().name());
        response.setConfirmedAt(user.getConfirmedAt());
        response.setCurrentSignInAt(user.getCurrentSignInAt());
        response.setLastSignInAt(user.getLastSignInAt());
        response.setSignInCount(user.getSignInCount());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
