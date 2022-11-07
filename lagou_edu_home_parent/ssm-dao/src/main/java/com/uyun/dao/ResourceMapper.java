package com.uyun.dao;

import com.uyun.domain.Resource;
import com.uyun.domain.ResourseVo;

import java.util.List;

public interface ResourceMapper {
    //资源分页 分页查询
    public List<Resource> findAllResourceByPage(ResourseVo resourceVo);
}
