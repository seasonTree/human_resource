//主的组件
const components = {
    "/user/Index": resolve =>
        require.ensure([], () => resolve(require("@view/user/Index"))),
    "/role/Index": resolve =>
        require.ensure([], () => resolve(require("@view/role/Index"))),
    "/permission/Index": resolve =>
        require.ensure([], () => resolve(require("@view/permission/Index"))),
};

export default components;