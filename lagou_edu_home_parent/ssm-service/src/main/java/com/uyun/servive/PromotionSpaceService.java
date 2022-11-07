package com.uyun.servive;

import com.uyun.domain.PromotionSpace;

import java.util.List;

public interface PromotionSpaceService {
    //获取所有广告位
    public List<PromotionSpace> findAllPromotionSpace();
    //添加广告位
    public void savePromotionSpace(PromotionSpace promotionSpace);
    //回显课程信息
    public PromotionSpace findPromotionSpaceById(int id);
    //修改广告位
    public void updatePromotionSpace(PromotionSpace promotionSpace);
}
