package com.uyun.servive.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.uyun.dao.ResourceMapper;
import com.uyun.domain.Resource;
import com.uyun.domain.ResourseVo;
import com.uyun.servive.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ResourceServiceImpl implements ResourceService {
    @Autowired
    ResourceMapper resourceMapper;

    @Override
    public PageInfo<Resource> findAllResourceByPage(ResourseVo resourceVo) {
        PageHelper.startPage(resourceVo.getCurrentPage(),resourceVo.getPageSize());
        List<Resource> page = resourceMapper.findAllResourceByPage(resourceVo);
        PageInfo<Resource> info = new PageInfo<>(page);
        return info;
    }
}
