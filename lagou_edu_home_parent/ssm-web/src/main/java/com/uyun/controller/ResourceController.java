package com.uyun.controller;

import com.github.pagehelper.PageInfo;
import com.uyun.domain.Resource;
import com.uyun.domain.ResourseVo;
import com.uyun.domain.ResponseResult;
import com.uyun.servive.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/resource")
public class ResourceController {
    @Autowired
    public ResourceService resourceService;
    @RequestMapping("findAllResource")
public ResponseResult findAllResourceByPage(@RequestBody ResourseVo resourseVo){
        PageInfo<Resource> byPage = resourceService.findAllResourceByPage(resourseVo);
        ResponseResult result = new ResponseResult(true, 200, "查询所有资源信息分页多条件查询成功", byPage);
        return result;
    }

}
