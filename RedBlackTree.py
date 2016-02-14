RED = 0
BLACK = 1


class NIL:
    parent = None


def rb_deletion(tree, del_node):
    # 默认情况，消失的颜色就是删除节点的
    missing_color = del_node.color

    # 没有小弟
    if del_node.small == NIL:
        # 锚点，违背5大性质的路径最低节点，修复时需沿着向上修复，NIL的情况将由 rb_replace 修复
        anchor = del_node.big

        # 大哥顶位
        rb_replace(tree, del_node, del_node.big)

    # 没有大哥
    elif del_node.big == NIL:
        anchor = del_node.small

        # 小弟顶位
        rb_replace(tree, del_node, del_node.small)

    # 有小弟又有大哥
    else:

        # 接替者为大哥半区的最小值
        successor = rb_min(del_node.big)

        # 接替者会继承删除节点的颜色，那么消失的颜色就是接替者的
        missing_color = successor.color

        # 接替者是子树最小值，不可能有小弟，将锚点置于大哥
        anchor = successor.big

        # 接替者是删除节点的第一个大哥，不需要整编
        if successor.parent == del_node:
            # 锚点有可能是NIL，并不影响大局，再赋值进行修复
            anchor.parent = successor

        # 接替者位于第一个大哥的小弟半区，不可能是NIL，但需要整编
        else:

            # 用接替者的大哥顶接替者的位，初步释放接替者
            rb_replace(tree, successor, successor.big)

            # 删除节点的大哥，仍然是接替者的大哥，指针重定向
            successor.big = del_node.big
            # 指针双向更新
            del_node.big.parent = successor

            # 至此，接替者已经释放完毕

        # 已经将接替者整理干净了，需替换和接管小弟操作
        rb_replace(tree, del_node, successor)

        # 全面接管删除点的小弟
        successor.small = del_node.small
        del_node.small.parent = successor

        # 继承删除节点的颜色
        successor.color = del_node.color

    # 如果弄丢的颜色是红色，那就无所谓了，只是把超重的节点，瘦身了一下，以上操作对路径上的黑色节点数量没有影响
    # 如果是黑色的，这边的树就变得营养不良了，需要修复
    if missing_color == BLACK:
        rb_del_fix(tree, anchor)


def rb_replace(tree, old, new):
    pass


def rb_min(node):
    pass


def rb_del_fix(tree, anchor):
    pass
