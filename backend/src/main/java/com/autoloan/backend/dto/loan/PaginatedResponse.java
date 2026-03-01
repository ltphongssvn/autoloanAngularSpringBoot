// backend/src/main/java/com/autoloan/backend/dto/loan/PaginatedResponse.java
package com.autoloan.backend.dto.loan;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedResponse<T> {
    private List<T> data;
    private int page;
    private int perPage;
    private long total;
    private int totalPages;
}
