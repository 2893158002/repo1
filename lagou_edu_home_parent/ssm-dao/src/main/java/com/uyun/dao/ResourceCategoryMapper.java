package com.uyun.dao;

import com.uyun.domain.ResourceCategory;

import java.util.List;

public interface ResourceCategoryMapper {
    //查询所有分类
    public List<ResourceCategory> findAllResourceCategory();
}
