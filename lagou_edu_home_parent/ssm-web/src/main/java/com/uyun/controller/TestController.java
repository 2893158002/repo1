package com.uyun.controller;

import com.uyun.domain.Test;
import com.uyun.servive.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/test")
public class TestController {
    @Autowired
    private TestService testService; 
    @RequestMapping("/findByTest")
    public List<Test> findByTest(){
        List<Test> byTest = testService.findByTest();
        return byTest;
    }
}
