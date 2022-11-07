package com.uyun.dao;

import com.uyun.domain.PromotionAd;

import java.util.List;

public interface PromotionAdMapper {
    //分页查询
    public List<PromotionAd> findAllPromotionAdByPage();
    //更改广告状态
    public void updatePromotionAdStatus(PromotionAd promotionAd);
}
