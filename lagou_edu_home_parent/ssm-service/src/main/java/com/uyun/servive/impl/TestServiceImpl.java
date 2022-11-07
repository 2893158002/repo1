package com.uyun.servive.impl;

import com.uyun.dao.TestMapper;
import com.uyun.domain.Test;
import com.uyun.servive.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestServiceImpl implements TestService {
    @Autowired
    private TestMapper testMapper;
    @Override
    public List<Test> findByTest() {
        List<Test> byTest = testMapper.findByTest();
        return byTest;
    }
}
