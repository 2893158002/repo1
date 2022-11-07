package com.uyun.dao;

import com.uyun.domain.Test;
import org.springframework.stereotype.Controller;

import java.util.List;
public interface TestMapper {
    public List<Test> findByTest();
}
