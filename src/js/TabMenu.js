import React from 'react';
import '../css/event.css';
import {withTranslation} from 'react-i18next';

/**
 * @class TabMenu
 * class for TabMenu -component in which Event, Entry and Note components are mounted
 * @author Markus Ojajärvi
 */
class TabMenu extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            activeTab: this.props.defaultTab
        };
        this.eventTab = React.createRef();
        this.entryTab = React.createRef();
        this.noteTab = React.createRef();
        this.tabcontent = React.createRef();
    }

    render() {
        const{t,i18n}=this.props;
        const tab = this.state.activeTab;
        return (
            <div className="tab">
                <button className="tablinks" onClick={() => this.activeTab(this.props.tab.eventTab)} ref={this.eventTab}>{t('event:event')}</button>
                <button className="tablinks" onClick={() => this.activeTab(this.props.tab.entryTab)} ref={this.entryTab}>{t('event:entry')}</button>
                <button className="tablinks" onClick={() => this.activeTab(this.props.tab.noteTab)} ref={this.noteTab}>{t('event:note')}</button>
                <br/><br/>
                <div ref={this.tabcontent}>{tab}</div>
            </div>)
    }

    /**
     * Changes the component's state, when clicking on the tab buttons.
     * @param tab
     * @returns {Promise<void>}
     * @author Markus Ojajärvi
     */
    async activeTab(tab) {
        await this.setState({activeTab: tab});
    }


}

export default withTranslation()(TabMenu);
