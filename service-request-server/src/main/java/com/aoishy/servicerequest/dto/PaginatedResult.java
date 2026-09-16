package com.aoishy.servicerequest.dto;

import java.util.List;

public class PaginatedResult<T> {

    private List<T> items;
    private long total;
    private int page;
    private int limit;
    private int totalPages;

    public PaginatedResult() {
    }

    public PaginatedResult(
            List<T> items,
            long total,
            int page,
            int limit,
            int totalPages
    ) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.totalPages = totalPages;
    }

    public List<T> getItems() {
        return items;
    }

    public void setItems(List<T> items) {
        this.items = items;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}