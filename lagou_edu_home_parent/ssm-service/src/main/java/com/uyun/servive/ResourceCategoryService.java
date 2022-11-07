package com.uyun.servive;

import com.uyun.domain.ResourceCategory;

import java.util.List;

public interface ResourceCategoryService {

    //查询所有分类
    public List<ResourceCategory> findAllResourceCategory();
}
