package com.uyun.servive.impl;

import com.uyun.dao.ResourceCategoryMapper;
import com.uyun.domain.ResourceCategory;
import com.uyun.servive.ResourceCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ResourceCategoryServiceImpl implements ResourceCategoryService {
    @Autowired
    private ResourceCategoryMapper resourceCategoryMapper;
    @Override
    public List<ResourceCategory> findAllResourceCategory() {
        List<ResourceCategory> category = resourceCategoryMapper.findAllResourceCategory();
        return category;
    }
}
