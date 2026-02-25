package com.autoloan.backend.service;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autoloan.backend.dto.user.UserProfileResponse;
import com.autoloan.backend.dto.user.UserUpdateRequest;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.User;
import com.autoloan.backend.model.enums.Role;
import com.autoloan.backend.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        existingUser = new User();
        existingUser.setId(1L);
        existingUser.setEmail("test@example.com");
        existingUser.setFirstName("John");
        existingUser.setLastName("Doe");
        existingUser.setPhone("555-1234");
        existingUser.setRole(Role.CUSTOMER);
        existingUser.setSignInCount(3);
    }

    @Test
    void getProfileShouldReturnUserProfile() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));

        UserProfileResponse response = userService.getProfile(1L);

        assertEquals(1L, response.getId());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals("555-1234", response.getPhone());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals(3, response.getSignInCount());
    }

    @Test
    void getProfileShouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> userService.getProfile(99L));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void updateProfileShouldUpdateAndReturn() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        UserUpdateRequest request = new UserUpdateRequest();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setPhone("555-9999");

        UserProfileResponse response = userService.updateProfile(1L, request);

        assertEquals("Jane", response.getFirstName());
        assertEquals("Smith", response.getLastName());
        assertEquals("555-9999", response.getPhone());
        verify(userRepository).save(existingUser);
    }

    @Test
    void updateProfileShouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        UserUpdateRequest request = new UserUpdateRequest();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setPhone("555-9999");

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> userService.updateProfile(99L, request));
        assertEquals("User not found", ex.getMessage());
    }
}
