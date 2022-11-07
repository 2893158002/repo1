package com.uyun.controller;

import com.uyun.domain.ResourceCategory;
import com.uyun.domain.ResponseResult;
import com.uyun.servive.ResourceCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ResourceCategory")
public class ResourceCategoryController {
    @Autowired
    private ResourceCategoryService resourceCategoryService;
    @RequestMapping("/findAllResourceCategory")
public ResponseResult findAllResourceCategory(){
    List<ResourceCategory> category = resourceCategoryService.findAllResourceCategory();
    return new ResponseResult(true,200,"查询所有分类信息成功",category);
}

}
