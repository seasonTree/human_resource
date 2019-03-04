import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store";
//组件模块登记
import components from "./components";

//因为全局路由守卫不能获取this，这里直接使用方法来获取是否登录
import {
    getUserInfo,
    getUserPermission
} from "../api/user";

Vue.use(VueRouter);

//基础的路由
const routes = [{
        //登陆
        path: "/login",
        component: () => import("@view/login"),
        meta: {
            name: "登录"
        }
    },
    {
        path: "/",
        component: () => import("@view/layout/Layout"),
        redirect: "/dashboard",

        children: [{
            path: "dashboard",
            component: () => import("@view/dashboard/Index"),
            meta: {
                name: "Dashboard",
                icon: "list-alt"
            }
        }]
    },
    {
        path: "/error",
        component: () => import("@view/error/Error"),
        meta: {
            notAuth: true
        }
    }
    //去除404页面，等待登陆后自动添加，未登录一直跳登录页面
    // {
    //     path: "/404",
    //     component: () => import("@view/error/NotFound"),
    //     meta: {
    //         notAuth: true
    //     }
    // }
];

//获取菜单按钮功能
//使用的数组一定要保持顺序
const getMenuData = data => {
    let quickTarget = {},
        //做多份，防止menu里面过多的数据，用于处理路由的
        routerQuickTarget = {},
        action = {},
        menu = [{
            url: "/dashboard",
            name: "Dashboard",
            icon: "fa fa-list-alt"
        }],
        routerArr = [];

    for (var i = 0; i < data.length; i++) {
        var item = data[i];

        if (item.p_type == 0) {
            //菜单
            quickTarget[item.id] = {
                url: item.url,
                name: item.p_name,
                icon: item.p_icon,
                parent_id: item.parent_id
            };

            //处理路由的 -------------------------------------
            routerQuickTarget[item.id] = {
                path: item.url,
                meta: {
                    name: item.p_name
                }
            };

            if (item.parent_id == 0) {
                //父
                routerQuickTarget[item.id]["component"] = resolve =>
                    require.ensure([], () => resolve(require("@view/layout/Layout")));
                routerQuickTarget[item.id]["redirect"] = `${item.url}/index`;
            } else {
                //子
                if (item.p_component) {
                    //如果子页面注册了组件，表示这个是个功能页面
                    //无法使用webpage的import的预编译,所以要预先定义组件列表
                    routerQuickTarget[item.id]["component"] =
                        components[item.p_component];

                    //注入url快速索引表，用于检查页面
                    // urlArr[item.url] = true;
                }
            }

            //----------------------------------------------
        } else if (item.p_type == 1) {
            action[item["p_act_name"]] = true;
        }
    }

    for (var key in quickTarget) {
        var item = quickTarget[key],
            parent_id = item.parent_id,
            routerItem = routerQuickTarget[key];

        if (item.parent_id == 0) {
            menu.push(item);

            //追加父路由
            routerArr.push(routerItem);
        } else if (parent_id != 0 && quickTarget[parent_id]) {
            quickTarget[parent_id].children = quickTarget[parent_id].children || [];
            quickTarget[parent_id].children.push(item);

            //路由------------------------------------------
            routerQuickTarget[parent_id].children =
                routerQuickTarget[parent_id].children || [];
            routerQuickTarget[parent_id].children.push(routerItem);

            //处理子路由
            if (parent_id != 0) {
                //处理面包屑
                var parentItem = routerQuickTarget[parent_id];
                routerItem.meta.paths = [
                    ...(parentItem.meta.paths || []),
                    {
                        name: parentItem.meta.name
                    }
                ];

                //处理子路由
                routerItem.path = routerItem.path.replace(parentItem.path + "/", "");
            }

            //---------------------------------------------
        }
    }

    //最后追加404页面
    routerArr.push({
        path: "*",
        component: () => import("@view/error/NotFound"),
        meta: {
            notAuth: true
        }
    });

    return {
        action,
        menu,
        routerArr
    };
};

//生成动态菜单
const genRoute = async (router, store) => {
    let suceess = true;
    try {
        // //同步获取数据，锁死整个页面
        let res = await getUserPermission(),
            pdata = res.data;

        // //测试数据
        // let res = {
        //         data: [{
        //                 id: 1,
        //                 parent_id: 0,
        //                 p_name: "Shopping Management",
        //                 p_type: 0,
        //                 p_icon: "fa fa-shopping-cart",
        //                 url: "",
        //                 p_act_name: "",
        //                 p_component: "/shopping",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 2,
        //                 parent_id: 1,
        //                 p_name: "Product",
        //                 p_type: 0,
        //                 p_icon: "fa fa-list",
        //                 url: "/shopping/product",
        //                 p_act_name: "",
        //                 p_component: "/product/Index",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 3,
        //                 parent_id: 1,
        //                 p_name: "Category",
        //                 p_type: 0,
        //                 p_icon: "fa fa-weight-hanging",
        //                 url: "/shopping/category",
        //                 p_act_name: "",
        //                 p_component: "/category/Index",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 4,
        //                 parent_id: 1,
        //                 p_name: "Package",
        //                 p_type: 0,
        //                 p_icon: "fa fa-cubes",
        //                 url: "/shopping/package",
        //                 p_act_name: "",
        //                 p_component: "/package/Index",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 5,
        //                 parent_id: 0,
        //                 p_name: "Promotion Management",
        //                 p_type: 0,
        //                 p_icon: "fa fa-money-bill-alt",
        //                 url: "",
        //                 p_act_name: "",
        //                 p_component: "/promotion",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 6,
        //                 parent_id: 5,
        //                 p_name: "Coupon",
        //                 p_type: 0,
        //                 p_icon: "fa fa-clone",
        //                 url: "/promotion/coupon",
        //                 p_act_name: "",
        //                 p_component: "/coupon/Index",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 7,
        //                 parent_id: 5,
        //                 p_name: "Subscription",
        //                 p_type: 0,
        //                 p_icon: "fa fa-envelope-square",
        //                 url: "/promotion/subscription",
        //                 p_act_name: "",
        //                 p_component: "/subscription/Index",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 8,
        //                 parent_id: 5,
        //                 p_name: "Campaign",
        //                 p_type: 0,
        //                 p_icon: "fa fa-cube",
        //                 url: "/promotion/campaign",
        //                 p_act_name: "",
        //                 p_component: "/campaign/Index",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 9,
        //                 parent_id: 0,
        //                 p_name: "Token System",
        //                 p_type: 0,
        //                 p_icon: "fa fa-money-check-alt",
        //                 url: "",
        //                 p_act_name: "",
        //                 p_component: "/token",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 10,
        //                 parent_id: 9,
        //                 p_name: "Token",
        //                 p_type: 0,
        //                 p_icon: "fa fa-coins",
        //                 url: "/token/index",
        //                 p_act_name: "",
        //                 p_component: "/token/Index",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 11,
        //                 parent_id: 9,
        //                 p_name: "Wallet",
        //                 p_type: 0,
        //                 p_icon: "fa fa-wallet",
        //                 url: "/token/wallet",
        //                 p_act_name: "",
        //                 p_component: "/wallet/Index",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 13,
        //                 parent_id: 0,
        //                 p_name: "User Management",
        //                 p_type: 0,
        //                 p_icon: "fa fa-users",
        //                 url: "",
        //                 p_act_name: "",
        //                 p_component: "/user",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 14,
        //                 parent_id: 13,
        //                 p_name: "User",
        //                 p_type: 0,
        //                 p_icon: "fa fa-user-friends",
        //                 url: "/user/index",
        //                 p_act_name: "",
        //                 p_component: "/user/Index",
        //                 api: "",
        //                 idx: 20,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:23:25",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 15,
        //                 parent_id: 13,
        //                 p_name: "Role",
        //                 p_type: 0,
        //                 p_icon: "fa fa-users-cog",
        //                 url: "/user/role",
        //                 p_act_name: "",
        //                 p_component: "/role/Index",
        //                 api: "",
        //                 idx: 30,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:24:07",
        //                 mfy_user: "admin",
        //                 mfy_time: "2019-01-07 09:48:46"
        //             },
        //             {
        //                 id: 16,
        //                 parent_id: 13,
        //                 p_name: "Permission",
        //                 p_type: 0,
        //                 p_icon: "fa fa-user-shield",
        //                 url: "/user/permission",
        //                 p_act_name: "",
        //                 p_component: "/permission/Index",
        //                 api: "",
        //                 idx: 40,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:24:29",
        //                 mfy_user: "admin",
        //                 mfy_time: "2019-01-07 09:48:46"
        //             },
        //             {
        //                 id: 17,
        //                 parent_id: 0,
        //                 p_name: "Log Management",
        //                 p_type: 0,
        //                 p_icon: "fa fa-file-alt",
        //                 url: "",
        //                 p_act_name: "",
        //                 p_component: "",
        //                 api: "",
        //                 idx: 19,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:22:11",
        //                 mfy_user: "admin",
        //                 mfy_time: "2018-12-27 15:20:03"
        //             },
        //             {
        //                 id: 18,
        //                 parent_id: 17,
        //                 p_name: "Log",
        //                 p_type: 0,
        //                 p_icon: "fa fa-book-open",
        //                 url: "/log/index",
        //                 p_act_name: "",
        //                 p_component: "/log/Index",
        //                 api: "",
        //                 idx: 40,
        //                 ct_user: "",
        //                 ct_time: "2018-12-14 14:24:29",
        //                 mfy_user: "admin",
        //                 mfy_time: "2019-01-07 09:48:46"
        //             },
        //         ],
        //         code: 200,
        //         msg: "获取权限成功"
        //     },
        //     pdata = res.data;
        // //-------------------------

        if (res.code == 200) {
            let mdata = getMenuData(pdata, menu, action),
                {
                    menu,
                    action,
                    routerArr
                } = mdata;

            store.commit("setMenu", menu);
            store.commit("setActions", action);

            router.addRoutes(routerArr);

            // router.addRoutes([{
            //         path: '/resume',
            //         component: () => import('@view/layout/Layout'),
            //         redirect: '/resume/index',
            //         meta: {
            //             name: '简历管理',
            //         },

            //         children: [{
            //             path: 'index',
            //             component: () =>
            //                 import('@view/resume/Index'),
            //             meta: {
            //                 name: '简历信息',
            //                 paths: [{
            //                     name: '简历管理'
            //                 }]
            //             }
            //         }]
            //     },
            //     {
            //         path: '/user',
            //         component: () => import('@view/layout/Layout'),
            //         redirect: '/user/index',

            //         children: [{
            //                 path: 'index',
            //                 component: () =>
            //                     import('@view/user/Index'),
            //                 meta: {
            //                     name: '用户信息',
            //                     paths: [{
            //                         name: '用户管理'
            //                     }]
            //                 }
            //             },
            //             {
            //                 path: 'role',
            //                 component: () =>
            //                     import('@view/role/Index'),
            //                 meta: {
            //                     name: '用户角色',
            //                     paths: [{
            //                         name: '用户管理'
            //                     }]
            //                 }
            //             },
            //             {
            //                 path: 'permission',
            //                 component: () =>
            //                     import('@view/permission/Index'),
            //                 meta: {
            //                     name: '用户权限',
            //                     paths: [{
            //                         name: '用户管理'
            //                     }]
            //                 }
            //             },
            //         ]
            //     },
            //     {
            //         path: '/report',
            //         component: () => import('@view/layout/Layout'),
            //         redirect: '/report/personal_recruitment',

            //         children: [{
            //             path: 'personal_recruitment',
            //             component: () =>
            //                 import('@view/report/PersonalRecruitment'),
            //             meta: {
            //                 name: '个人招聘统计',
            //                 paths: [{
            //                     name: '报表'
            //                 }]
            //             }
            //         }, ]
            //     }
            // ]);
        } else {
            suceess = false;
        }
    } catch (e) {
        suceess = false;
    } finally {
        return suceess;
    }
};

//初始化路由
const router = new VueRouter({
    routes
});

//用于处理刷新后是否重新获取重新渲染页面
let initRouter = false;

router.beforeEach(async (to, from, next) => {
    let toPath = to.path;
    //直接过滤掉的页面，不要验证
    if (to.meta.notAuth === true) {
        next();
        return;
    }

    // //TODO 测试使用 --------------------
    // let user = {
    //     id: 1,
    //     uname: "admin",
    //     avatar: "",
    //     personal_name: "",
    //     phone: "",
    //     status: 0,
    //     ct_user: "",
    //     ct_time: "2018-12-29 15:02:09",
    //     mfy_user: "admin",
    //     mfy_time: "2019-01-15 13:41:08",
    //     token: "232be93a32c229a03ed312e05c9c3feef8157e07f426c10abcdc258a31b2eff0"
    // };
    // store.commit("setUserInfo", user);

    // //---------------------------------------

    //获取当前登录的用户
    let user = store.getters.userInfo;
    if (!user.userid) {
        let checkError = false;

        try {
            let res = await getUserInfo(),
                udata = res.data;

            if (res.code == 200) {
                user = udata;
                store.commit("setUserInfo", udata);
            } else {
                store.commit("clearUserInfo");
            }
        } catch (error) {
            checkError = true;
        } finally {
            if (checkError) {
                router.push("/error");
                return;
            }
        }
    }

    //初始化路由成功后,如果当前用户没有登录的话，跳到登录
    if (user.userid) {
        //初始化菜单------------------------

        if (!initRouter) {
            let suceess = await genRoute(router, store);

            if (suceess) {
                initRouter = true;
                //一定要写toPath, 用于等待数据返回再次刷新
                next({
                    path: toPath
                });
            } else {
                //跳到出错页面
                router.push("/error");
            }
        } else if (toPath == "/login") {
            
            //登录后还想跳到登录页面的，直接跳首页
            router.replace("/dashboard");
        } else {
            //menu都有了直接next
            next();
        }

        //---------------------------
    } else if (toPath != "/login") {
        //没有登录,并且想跳到其他地方，直接跳到登录
        router.replace("/login");
    } else {
        //登录页面直接跳转
        next();
    }
});

export default router;