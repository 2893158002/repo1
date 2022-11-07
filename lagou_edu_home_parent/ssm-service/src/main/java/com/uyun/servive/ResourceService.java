package com.uyun.servive;

import com.github.pagehelper.PageInfo;
import com.uyun.domain.Resource;
import com.uyun.domain.ResourseVo;

import java.util.List;

public interface ResourceService {
    //资源分页 分页查询
    public PageInfo<Resource> findAllResourceByPage(ResourseVo resourceVo);
}
