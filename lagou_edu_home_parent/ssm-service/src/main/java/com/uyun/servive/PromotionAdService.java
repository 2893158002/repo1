package com.uyun.servive;

import com.github.pagehelper.PageInfo;
import com.uyun.dao.PromotionSpaceMapper;
import com.uyun.domain.PromotionAd;
import com.uyun.domain.PromotionAdVO;
import com.uyun.domain.PromotionSpace;

import java.util.List;

public interface PromotionAdService {
    public PageInfo<PromotionAd> findAllPromotionAdByPage(PromotionAdVO promotionAdVO);

    //广告动态上下线
    public void updatePromotionAdStatus(int id,int status);

}
