package com.uyun.dao;

import com.uyun.domain.PromotionSpace;

import java.util.List;

public interface PromotionSpaceMapper {
    //获取所有广告位
    public List<PromotionSpace> findAllPromotionSpace();
    //添加广告位
    public void savePromotionSpace(PromotionSpace promotionSpace);
    //回显广告信息
    public PromotionSpace findPromotionSpaceById(int id);
    //修改广告位
    public void updatePromotionSpace(PromotionSpace promotionSpace);
}
