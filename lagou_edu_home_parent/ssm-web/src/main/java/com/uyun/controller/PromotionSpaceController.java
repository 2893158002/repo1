package com.uyun.controller;

import com.uyun.domain.PromotionSpace;
import com.uyun.domain.ResponseResult;
import com.uyun.servive.PromotionSpaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/PromotionSpace")
public class PromotionSpaceController {
    @Autowired
    private PromotionSpaceService promotionSpaceService;

    @RequestMapping("/findAllPromotionSpace")
    public ResponseResult findAllPromotionSpace() {
        List<PromotionSpace> space = promotionSpaceService.findAllPromotionSpace();
        ResponseResult result = new ResponseResult(true, 200, "查询广告位成功", space);
        return result;
    }
    //a添加修改广告位
    @RequestMapping("/saveOrUpdatePromotionSpace")
public ResponseResult savePromotionSpace(@RequestBody PromotionSpace promotionSpace){
        if(promotionSpace.getId() == null){
        promotionSpaceService.savePromotionSpace(promotionSpace);
        ResponseResult result = new ResponseResult(true, 200, "新增广告位成功", null);
        return result;
        }else {
            promotionSpaceService.updatePromotionSpace(promotionSpace);
            return new ResponseResult(true,200,"修改广告位成功",null);
        }
    }

//    回显广告位信息
    @RequestMapping("/findPromotionSpaceById")
    public ResponseResult findPromotionSpaceById(int id){
        PromotionSpace space = promotionSpaceService.findPromotionSpaceById(id);
        return new ResponseResult(true,200,"广告回显成功",space);
    }
}
