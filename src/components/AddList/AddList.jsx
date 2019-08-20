/**
 * 自定义表单控件
 * @Author: Z 
 * @Date: 2019-06-03 09:40:14 
 * @Last Modified by: Z
 * @Last Modified time: 2019-08-20 18:56:39
 */
import React from 'react';
import { Icon, message, Form } from "antd";
import _ from 'lodash';
import './AddList.scss';
class AddList extends React.Component {
    /**
     * 
     * @param {object} props 
     * @param {string[]} [props.widths] 
     * @param {string} [props.primaryKey]
     */
    static defaultProps = {
        defaultItem: {},// 新增时默认添加的数据
        widths: [],
        titles: [],
        controls: [],
        onAdd: _.noop,
        onRemove: _.noop,
        onChange: _.noop,
    }
    state = {
        value: this.props.value || [],
    }
    // 通过from读写控件值
    // form 表单的values的key由字段+序号构成
    // 通过指定primaryKey来标识一条记录，primaryKey不能重复
    // 如果没在props里显式传入primaryKey，则默认使用controls中的第一个作为primaryKey
    get(values) {
        let { primaryKey, controls, extraParam } = this.props;
        if (controls.length == 0) { return; }

        // 所有字段
        let fields = controls.map(({ code }) => {
            return code;
        });
        let keys = Object.keys(values);
        primaryKey = primaryKey || keys[0].split('_')[0];
        return keys.filter((s) => {
            return s.indexOf(primaryKey) != -1;
        }).map((s) => {
            return s.split('_')[1];
        }).sort((a, b) => {
            // 按照索引排序，否则会跳动
            return a - b;
        }).map((i) => {
            let result = {};
            fields.forEach((field) => {
                result[field] = values[field + '_' + i];
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
                values[key + '_' + index] = item[key];
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
        // console.log('删除一条，当前数据', value);
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
        // console.log('新增一条，当前数据', value);
        this.setState({ value }, () => {
            onChange && onChange(value);
            onAdd(value.length);
        });
    }

    handleChange = (val, code, index) => {
        // let { primaryKey, onChange } = this.props;
        // let { value } = this.state;
        // value = [...value];
        // let i = value.findIndex((item) => {
        //     return item[primaryKey] == index;
        // });
        // if (i != -1) {
        //     value[i] = {
        //         ...value[i],
        //         [code]: val
        //     };
        // } 
        // this.setState({ value });
        // // console.log(value);
        // onChange(value);
        setTimeout(() => {
            let { form, onChange, } = this.props;

            let { getFieldsValue } = form;
            let values = getFieldsValue();
            let value = this.get(values);
            // console.log('修改一条，当前数据：', value);
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
        if (JSON.stringify(prevState.value) != JSON.stringify(value)) {
            this.set();
        }
    }
    static getDerivedStateFromProps(nextProp, nextState) {
        let { value } = nextProp;
        if (value) {
            return { value };
        }
        return {};
    }
    render() {
        let {  ItemProps, unique, controls = [], titles, widths = [] } = this.props;
        let { value } = this.state;

        return <div className={"add-list"}>
            <div className="add-list-title-wrapper">
                {titles.map((t, i) => {
                    let w = widths[i];
                    return <div className="add-list-title" style={{ width: w }} key={i}>{t}</div>;
                })}
            </div>
            <div className="add-list-item-wrapper">{value.map((data, key) => {
                return <AddItem
                    key={key}
                    index={key}
                    unique={unique}
                    onRemove={this.handleRemove}
                ><Item {...ItemProps}
                    onChange={this.handleChange}
                    // onBlur={this.handleBlur}
                    // onFocus={this.handleFocus}
                    data={data} controls={controls} widths={widths}
                    index={key} form={this.props.form} />
                </AddItem>
            })}
            </div>
            <div>
                <Icon type="plus-circle"
                    className="plus-item-button cursor"
                    title="新增"
                    onClick={this.handleAdd}
                />
            </div>
        </div>
    }
}
export default Form.create({})(AddList);

class Item extends React.Component {
    getField(code, index) {
        return code + '_' + index;
    }
    render() {
        let { widths, controls, form, index, onChange, data } = this.props;
        const { getFieldDecorator } = form;

        return <div className="inline-controls">
            {controls.map(({ Ctrl, props, code, options, visible }, i) => {
                let w = widths[i];
                let id = this.getField(code, index);
                // XXX:
                let show = typeof visible == 'function' ? visible(data) : true;
                return <div style={{ width: w }} key={i} >{
                    <Form.Item>
                        {getFieldDecorator(id, { ...options })(show ? <Ctrl
                            onChange={(value) => {
                                onChange(value, code, index);
                            }}
                            {...props}
                        /> :
                            <span></span>)}
                    </Form.Item>
                }</div>
            })}
        </div>
    }
}
/**
 * AddList 直接子元素，用于包裹List的一行控件
 * @props {boolean} unique  是否是唯一的一个，是的话不显示删除该行按钮
 * @props index 索引 通过primaryKey 指定
 * @props onRemove 删除按钮点击事件
 */
class AddItem extends React.Component {
    handleRemove = () => {
        let { index, onRemove } = this.props;
        onRemove && onRemove(index)
    }
    render() {
        let { unique, children } = this.props;
        return <div className="add-item">
            {unique ? null :
                <Icon type="minus-circle"
                    className="minus-item-button cursor"
                    title="删除该行"
                    onClick={this.handleRemove}
                />
            }
            {children}
        </div>
    }
}