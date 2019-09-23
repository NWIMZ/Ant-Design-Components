/**
 * 自定义表单控件
 * 可增减的控件
 * @Author: Z 
 * @Date: 2019-06-03 09:40:14 
 * @Last Modified by: Z
 * @Last Modified time: 2019-08-23 13:41:07
 */
import React from 'react';
import { Icon, message, Form } from "antd";
import _ from 'lodash';
import './index.scss';
function getId(key, index) {
    return key + '_' + index;
}
class DynamicForm extends React.Component {
    /**
     * 
     * @param {object} props 
     * @param {string} [props.dataIndex]
     * @param {any[]} [props.columns]
     */
    constructor(props) {
        super(props);
        const { dataIndex, columns } = props;
        this.dataIndex = dataIndex || columns[0].key;
    }

    static defaultProps = {
        defaultItem: {},// 新增时默认添加的数据
        onAdd: _.noop,
        onRemove: _.noop,
        onChange: _.noop,
    }
    state = {
        value: this.props.value || [],
    }
    // 通过from读写控件值
    // form 表单的values的key由字段+序号构成
    // 通过指定dataIndex来标识一条记录，dataIndex不能重复
    // 如果没在props里显式传入dataIndex，则默认使用columns中的第一个作为dataIndex
    get(values) {
        let { columns, extraParam } = this.props;
        if (columns.length === 0) { return; }

        // 所有字段
        let fields = columns.map(({ key }) => key);
        let keys = Object.keys(values);
        return keys.filter((s) => {
            return s.indexOf(this.dataIndex) !== -1;
        }).map((s) => {
            return s.split('_')[1];
        }).sort((a, b) => {
            // 按照索引排序，否则会跳动
            return a - b;
        }).map((i) => {
            let result = {};
            fields.forEach((field) => {
                result[field] = values[getId(field, i)];
            });
            return { ...result, ...extraParam };
        });
    }
    set() {
        let { value } = this.state;
        let { form } = this.props;
        let values = {};
        (value || []).forEach((item, index) => {
            let keys = Object.keys(item);
            keys.forEach((key) => {
                values[getId(key, index)] = item[key];
            });
        });
        form.setFieldsValue(values);
    }
    // 删除
    handleRemove = (key) => {
        let { onRemove, onChange, form } = this.props;
        let { value } = this.state;
        value = [...value];
        // if (list.length <= 1) { return message.error(`至少要有一项`); }
        _.pullAt(value, [key]);
        form.resetFields();
        this.setState({ value }, () => {
            onChange && onChange(value);
            onRemove && onRemove(value);
        });
    }
    // 新增
    handleAdd = () => {
        let { onAdd, onChange, maxNum, defaultItem } = this.props;
        let { value } = this.state;
        value = [...value];
        if (maxNum && maxNum <= value.length) {
            message.error(`最多添加${maxNum}项`);
            return;
        }
        value.push(defaultItem);
        this.setState({ value }, () => {
            onChange && onChange(value);
            onAdd(value.length);
        });
    }

    handleChange = (val, code, index) => {
        // let { dataIndex, onChange } = this.props;
        // let { value } = this.state;
        // value = [...value];
        // let i = value.findIndex((item) => {
        //     return item[dataIndex] == index;
        // });
        // if (i != -1) {
        //     value[i] = {
        //         ...value[i],
        //         [code]: val
        //     };
        // } 
        // this.setState({ value });
        // onChange(value);
        setTimeout(() => {
            let { form, onChange, } = this.props;

            let { getFieldsValue } = form;
            let values = getFieldsValue();
            let value = this.get(values);
            this.setState({ value }, () => {
                onChange(value)
            });
        }, 0)
    }

    componentDidMount() {
        let { onMount } = this.props;
        this.set();
        onMount && onMount(this);
    }
    componentDidUpdate(prevProps, prevState) {
        let { value } = this.state;
        if (JSON.stringify(prevState.value) !== JSON.stringify(value)) {
            this.set();
        }
    }
    static getDerivedStateFromProps(nextProp, prevState) {
        let { value } = nextProp;
        if (value) {
            return { value };
        }
        return {};
    }
    render() {
        let { unique, columns, className = '' } = this.props;
        let { value } = this.state;
        columns = columns.filter(({ visible }) => {
            if (typeof visible === 'function') {
                return value.some((item) => {
                    return visible(item);
                });
            } else {
                return true;
            }
        })
        return <table className={"add-list " + className}>
            <thead className="add-list-title-wrapper">
                <tr>
                    <th></th>
                    {columns.map(({ width, title, key }, i) => {
                        return <th className="add-list-title" style={{ width }} key={key}>{title}</th>;
                    })}
                </tr>
            </thead>
            <tbody className="add-list-item-wrapper">{value.map((data, key) => {
                return <AddItemRow
                    key={key}
                    index={key}
                    unique={unique}
                    onRemove={this.handleRemove}
                ><Item
                        index={key}
                        onChange={this.handleChange}
                        // onBlur={this.handleBlur}
                        // onFocus={this.handleFocus}
                        data={data}
                        columns={columns}
                        form={this.props.form} />
                </AddItemRow>
            })}
            </tbody>
            <tfoot>
                <tr>
                    <td>
                        <Icon type="plus-circle"
                            className="plus-item-button cursor"
                            title="新增"
                            onClick={this.handleAdd}
                        />
                    </td>
                </tr>
            </tfoot>
        </table>
    }
}
export default Form.create({})(DynamicForm);

class Item extends React.Component {
    render() {
        let { columns, form, index, onChange, data } = this.props;
        const { getFieldDecorator } = form;

        return <React.Fragment>
            {columns.map(({ Component, props, width, key, options, visible }, i) => {
                let id = getId(key, index);
                let show = typeof visible === 'function' ? visible(data) : true;
                return <td className="add-list-item-control" key={i} >{
                    show ?
                        <Form.Item style={{ width }} >
                            {getFieldDecorator(id, options)(<Component
                                onChange={(value) => {
                                    onChange(value, key, index);
                                }}
                                {...props}
                            />)}
                        </Form.Item>
                        :
                        null
                }</td>
            })}
        </React.Fragment>
    }
}
/**
 * DynamicForm 直接子元素，用于包裹List的一行控件
 * @props {boolean} unique  是否是唯一的一个，是的话不显示删除该行按钮
 * @props index 索引 通过dataIndex 指定
 * @props onRemove 删除按钮点击事件
 */
class AddItemRow extends React.Component {
    handleRemove = () => {
        let { index, onRemove } = this.props;
        onRemove && onRemove(index)
    }
    render() {
        let { unique, children } = this.props;
        return <tr className="add-list-item">
            <td className="ant-form-item">
                {unique ? null :
                    <Icon type="minus-circle"
                        className="minus-item-button cursor"
                        title="删除该行"
                        onClick={this.handleRemove}
                    />
                }
            </td>
            {children}
        </tr>
    }
}