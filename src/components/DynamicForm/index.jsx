/**
 * 自定义表单控件
 * 可增减的控件
 * @Author: Z 
 * @Date: 2019-06-03 09:40:14 
 * @Last Modified by: Z
 * @Last Modified time: 2019-08-23 13:41:07
 */
import React from 'react';
import { Icon, Input, message, Form } from "antd";
import _ from 'lodash';
import classnames from 'classnames';
import './index.scss';
function getId(key, index) {
    return key + '_' + index;
}
class DynamicFieldSet extends React.Component {
    static defaultProps = {
        defaultItem: {},
        hiddenField: [],
        columns: [],
        dynamic: true,
        onAdd: _.noop,
        onRemove: _.noop,
        onChange: _.noop,
    }
    state = {
        value: this.props.value || this.props.initialValue || [],
    }
    hasSubForm = this.props?.columns.some(({ props }) => {
        return props?.columns?.length > 0
    })
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
        let { onAdd, onChange, maxNum, defaultItem, parent } = this.props;
        let { value } = this.state;
        value = [...value];
        if (maxNum && maxNum <= value.length) {
            message.error(`最多添加${maxNum}项`);
            return;
        }
        if (typeof defaultItem === 'function') {
            defaultItem = defaultItem(parent || {});
        }
        value.push(defaultItem);
        this.setState({ value }, () => {
            onChange && onChange(value);
            onAdd(value.length);
        });
    }

    componentDidMount() {
        let { onMount, onFormSend } = this.props;
        this.set();
        onMount && onMount(this);
        onFormSend && onFormSend(this.props.form);
    }
    componentDidUpdate(prevProps, prevState) {
        let { value } = this.state;
        // XXX:
        if (JSON.stringify(prevState.value) !== JSON.stringify(value)) {
            this.set();
        }
    }
    static getDerivedStateFromProps(nextProp, prevState) {
        let { value } = nextProp;
        return { value: value || nextProp.initialValue || [] };
    }
    getTitles(columns, index = 0) {
        let { dynamic } = this.props;
        let titles = [];
        columns.forEach((({ width, minWidth, title, key, props }, i) => {
            let k = `${index}-${i}`;
            if (getSubFormLength(props) > 0) {
                titles.push(<th className="divide-line" key={`divide-line-${k}`}></th>)
                if (dynamic) {
                    titles.push(<th className="add-button-title" key={`add-button-${k}`}></th>)
                }
                titles = titles.concat(this.getTitles(props.columns, i));
            } else {
                titles.push(<th className="add-list-title" style={{ width, minWidth }} key={`${k}`}>{title}</th>);
            }
        }));
        if (index === 0) {
            titles.push(<th className="hidden-field" key="hidden-field"></th>);
        }
        return titles;
    }
    render() {
        let { unique, columns, hiddenField, className = '', dynamic, footer = 'button', addText = "新增", title, onFormSend } = this.props;
        let { value } = this.state;
        columns = columns.filter(({ visible, alwaysShowTitle }) => {
            if (typeof visible === 'function') {
                return alwaysShowTitle || value.some((item) => {
                    return visible(item);
                });
            } else {
                return true;
            }
        });
        let Titles = this.getTitles(columns)
        return <div className={classnames("add-list-wrapper", { 'add-list-style2': title })}>
            {title ? <h4>{title}</h4> : null}
            <table className={classnames("add-list", className)}>
                <thead className="add-list-title-wrapper">
                    <tr>
                        {dynamic ? <th></th> : null}
                        {Titles}
                    </tr>
                </thead>
                <tbody className="add-list-item-wrapper">{value.map((data, key) => {
                    return <React.Fragment key={key}>
                        <AddItemRow
                            index={key}
                            dynamic={dynamic}
                            unique={unique}
                            onRemove={this.handleRemove}
                        ><Item
                                index={key}
                                // onChange={this.handleChange}
                                // onBlur={this.handleBlur}
                                // onFocus={this.handleFocus}
                                data={data}
                                columns={columns}
                                hiddenField={hiddenField}
                                onFormSend={onFormSend}
                                form={this.props.form} />
                        </AddItemRow>
                        {(this.hasSubForm && key !== value.length - 1) ? <tr className="divide-line-horizon"><td colSpan={Titles.length}></td></tr> : null}
                    </React.Fragment>
                })}
                </tbody>
                <tfoot>
                    {dynamic ? <tr>
                        {footer === 'button' ? <td><Icon type="plus-circle"
                            className="plus-item-button cursor"
                            title="新增"
                            onClick={this.handleAdd}
                        /></td> : <td colSpan="1000"><div className="add-bar-button">
                            {/* eslint-disable-next-line */}
                            <a href="javascript:;" onClick={this.handleAdd}><Icon type="plus" />{addText}</a>
                        </div></td>}
                    </tr> : null}
                </tfoot>
            </table>
        </div>
    }
}
// 整个form的change事件
const onValuesChange = _.debounce(function (props, changedValues, allValues) {
    let { columns = [], hiddenField = [], extraParam, onChange, dataIndex } = props;
    dataIndex = dataIndex || columns[0].key
    if (columns.length === 0) { return; }
    // 所有字段
    let fields = [...columns, ...hiddenField].map(({ key }) => key);
    let keys = Object.keys(allValues);
    let value = keys.filter((s) => {
        return s.indexOf(dataIndex) !== -1;
    }).map((s) => {
        return s.split('_')[1];
    }).sort((a, b) => {
        // 按照索引排序，否则会跳动
        return a - b;
    }).map((i) => {
        let result = {};
        fields.forEach((field) => {
            result[field] = allValues[getId(field, i)];
        });
        return { ...result, ...extraParam };
    });
    onChange && onChange(value);
}, 100);
export default Form.create({
    onValuesChange
})(DynamicFieldSet);


function getSubFormLength(props) {
    return props?.columns?.length;
}
class Item extends React.Component {
    render() {
        let { columns, hiddenField, form, index, data, onFormSend } = this.props;
        const { getFieldDecorator } = form;

        return <React.Fragment>
            {columns.map(({ Component, props: { onChange, onClick, ...props } = {}, width, className = '', key, options, visible, link, click }, i) => {
                let id = getId(key, index);
                let show = typeof visible === 'function' ? visible(data) : true;

                let extraProps = {}
                let subFormLength = getSubFormLength(props);
                // 嵌套
                if (subFormLength) {
                    extraProps = { onFormSend, parent: data };
                }
                let colSpan = subFormLength ? subFormLength + 1 : 1;
                return <React.Fragment key={i}>
                    {subFormLength ?
                        <td className="divide-line-vertical">

                        </td> : null
                    }
                    <td className={classnames("add-list-item-control", className)} colSpan={colSpan} >{
                        show ?
                            <Form.Item style={{ width }} >
                                {getFieldDecorator(id, options)(<Component {...props} {...extraProps}
                                    onChange={(...params) => {
                                        onChange && onChange(...params);
                                        link && link(index, getId, form, ...params);
                                    }}
                                    onClick={(...params) => {
                                        onClick && onClick(...params, index, getId, form);
                                    }}
                                />)}
                            </Form.Item>
                            :
                            null
                    }</td>
                </React.Fragment>

            })}
            <td className="hidden-field">
                {
                    hiddenField.map(({ key }) => {
                        return <Form.Item key={key}>
                            {getFieldDecorator(getId(key, index), {})(<Input type="hidden" />)}
                        </Form.Item>
                    })
                }
            </td>
        </React.Fragment>
    }
}
/**
 * DynamicFieldSet 直接子元素，用于包裹List的一行控件
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
        let { unique, dynamic, children } = this.props;
        return <tr className="add-list-item">
            {dynamic ? <td className="ant-form-item">
                {unique ? null :
                    <Icon type="minus-circle"
                        className="minus-item-button cursor"
                        title="删除该行"
                        onClick={this.handleRemove}
                    />
                }
            </td> : null}
            {children}
        </tr>
    }
}