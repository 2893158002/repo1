package com.uyun.servive;

import com.uyun.domain.Menu;

import java.util.List;

public interface MenuService {
    public List<Menu> findSubMenuListByPid(int pid);

    //查询角色信息
    public List<Menu> findAllMenu();

   public Menu findMenuById(Integer id);
}
