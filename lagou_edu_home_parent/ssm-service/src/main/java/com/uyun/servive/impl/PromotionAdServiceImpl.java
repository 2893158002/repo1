package com.uyun.servive.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.uyun.dao.PromotionAdMapper;
import com.uyun.domain.PromotionAd;
import com.uyun.domain.PromotionAdVO;
import com.uyun.servive.PromotionAdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
@Service
public class PromotionAdServiceImpl implements PromotionAdService {
   @Autowired
    private PromotionAdMapper promotionAdMapper;

    @Override
    public PageInfo<PromotionAd> findAllPromotionAdByPage(PromotionAdVO promotionAdVO) {
        PageHelper.startPage(promotionAdVO.getCurrentPage(), promotionAdVO.getPageSize());
        List<PromotionAd> adByPage = promotionAdMapper.findAllPromotionAdByPage();
        PageInfo<PromotionAd> pageInfo = new PageInfo<>(adByPage);
        return pageInfo;
    }

    @Override
    public void updatePromotionAdStatus(int id, int status) {
        PromotionAd ad = new PromotionAd();
        ad.setId(id);
        ad.setStatus(status);
        ad.setUpdateTime(new Date());
        promotionAdMapper.updatePromotionAdStatus(ad);
    }
}
