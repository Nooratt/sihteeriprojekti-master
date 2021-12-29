import React from 'react';
import { withTranslation } from 'react-i18next';
import '../css/profile.css';
import Tooltip from "react-simple-tooltip";
import {getFromBackend, postPic, updateBackend} from "./Ajax";
let profilepic = require('../img/mirkku.png');

/**
 * Class for the Profile component
 * @author Noora Turunen, Markus Ojajärvi
 * @class Profile
 */
class Profile extends React.Component {

    constructor(props){
        super(props);
        this.profileName = React.createRef();
        this.profileLName = React.createRef();
        this.profileEmail = React.createRef();
        this.profileSection = React.createRef();


        this.state = {
            profileName: "",
            profileLName: "",
            profileEmail: "",
            showEditPage: false,
            file: '',
            imagePreviewUrl: profilepic,
            imageUrl:profilepic,

        };
        this.myCallback = this.myCallback.bind(this);
        this.componentDidMount=this.componentDidMount.bind(this);
        this.editProfile=this.editProfile.bind(this);
        this.submit=this.submit.bind(this);
        this.cancel=this.cancel.bind(this);
        this.validateName=this.validateName.bind(this);
        this.validateLastName=this.validateLastName.bind(this);
        this.validateEmail=this.validateEmail.bind(this);
        this.runValidations=this.runValidations.bind(this);
        this.myCallback2=this.myCallback2.bind(this);
        this._handleImageChange=this._handleImageChange.bind(this);
        this._handleSubmit=this._handleSubmit.bind(this);


    }
    render(){
        const {t, i18n} = this.props;
        if(!this.state.showEditPage) {
            let {imageUrl} = this.state;
            let $image = null;
            if (imageUrl) {
                $image = (<img src={imageUrl}/>);
            }
            return (
                <article id="profileSection" ref={this.profileSection}>
                    <div className="imgPreview">
                        {$image}
                    </div>
                    <br/>
                    <p id="profileName" ref={this.profileName}>{this.state.profileName} {this.state.profileLName}</p>
                    <p id="profileEmail" ref={this.profileEmail}>{this.state.profileEmail}</p>
                    <br/>
                    <button id={"editProfile"} onClick={this.editProfile}>{t('profile:edit')}</button> <br></br>


                </article>
            );
        }else if(this.state.showEditPage){
            let {imagePreviewUrl} = this.state;
            let $imagePreview = null;
            if (imagePreviewUrl) {
                $imagePreview = (<img src={imagePreviewUrl}/>);
            } else {
                $imagePreview = (<div className="previewText">{t('profile:image')}</div>);
            }
            return (
                <article id="profileSection">
                    <div className="previewComponent">
                        <form onSubmit={(e)=>this._handleSubmit(e)} action={"/pic"} method={'post'} encType={'multipart/form-data'}>
                            <input className="fileInput"
                                   type="file" name={'avatar'}
                                   onChange={(e)=>this._handleImageChange(e)} />
                            <button className="submitButton"
                                    type="submit"
                                    onClick={(e)=>this._handleSubmit(e)}>{t('profile:upload')}</button>
                        </form>
                        <div className="imgPreview">
                            {$imagePreview}
                        </div>
                    </div>
                    <br/>
                    <p>{t('profile:firstname')}</p>
                    <input type={"text"} id="profileEditName" ref={this.profileName}  defaultValue={this.state.profileName} placeholder={this.state.profileName} pattern="[A-Za-z]{2,}"/>
                    <br/>
                    <p>{t('profile:lastname')}</p>
                    <input type={"text"} id="profileEditLName" ref={this.profileLName} defaultValue={this.state.profileLName} placeholder={this.state.profileLName} pattern="[A-Za-z]{2,}"/>
                    <br/>
                    <p>{t('profile:email')}</p>
                    <input type={"email"} id={"profileEditEmail"} ref={this.profileEmail} defaultValue={this.state.profileEmail} placeholder={this.state.profileEmail} pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"/>
                    <br/>
                    <button id={"SubmitEdit"} type='submit' onClick={this.submit}>{t('profile:save')}</button>
                    <button id={"CancelEdit"} onClick={this.cancel}>{t('profile:cancel')}</button>


                </article>);
        }
    }
    componentDidMount(){
        getFromBackend({},'profiles', this.myCallback);
    }

    /**
     * Sets new image as state when new one is loaded
     * @author Noora Turunen
     * @param e: clicking event, for getting the target
     */
    _handleImageChange(e) {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.target.files[0];

        reader.onloadend = () => {
            this.setState({
                file: file,
                imagePreviewUrl: reader.result
            });
        };

        reader.readAsDataURL(file)
    }

    /**
     * Stores the file from state when image is submitted
     * @author Noora Turunen
     * @param e: event
     */
    _handleSubmit(e) {
        e.preventDefault();
        // TODO: do something with -> this.state.file
        console.log('handle uploading-', this.state.file);
        var params={file:this.state.file};
        postPic(params,'app/pic',callbacki);
        function callbacki(result){
            console.log(result);
        }

    }


    /**
     * Sets profile states according to the result from back end
     * @author Noora Turunen
     * @param result:the result from back end
     */
    myCallback(result){
        var jresult=JSON.parse(result);
        this.setState({profileName:jresult.FirstName,profileLName:jresult.LastName,profileEmail:jresult.Email});
    };

    /**
     * Changes to profile editing view
     * @author Noora Turunen
     */
    editProfile() {
        this.setState({showEditPage:true});
    };

    /**
     * Checks if the name user has submitted is more than two letters
     * @author Julia Virtanen
     * @return boolean: true if the name is valid
     */
    validateName(){
        var trimmedName = this.profileName.current.value.trim();
        if (this.profileName.current.validity.patternMismatch||trimmedName.length<=0) {
            alert("First name is invalid");
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Checks if the last name user has submitted is more then two letters
     * @author Julia Virtanen
     * @return boolean: true if the last name is valid
     */
    validateLastName(){
        var trimmedName = this.profileLName.current.value.trim();
        if (this.profileLName.current.validity.patternMismatch||trimmedName.length<=0) {
            alert("Last name is invalid");
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Checks if the email user has submitted is valid
     * @author Julia Virtanen
     * @return boolean: true if the email is valid
     */
    validateEmail(){
        var trimmedMail=this.profileEmail.current.value.trim();
        if (this.profileEmail.current.validity.patternMismatch||trimmedMail.length<=0) {
            alert("Email is invalid");
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * Runs all the profile validations and check if they're all valid
     * @author Julia Virtanen
     * @return boolean: true if all user data is valid
     */
    runValidations(){
        var name=this.validateName();
        var lastName=this.validateLastName();
        var email=this.validateEmail();
        if(name&&lastName&&email){
            return true;
        }else{
            return false;
        }
    };

    /**
     * Sends profile updates to back end if data is valid
     * @author Noora Turunen
     *
     */
    submit(){

        var validations=this.runValidations();
        console.log(this.state.file);
        if(validations){
            var params={name:this.profileName.current.value,lname:this.profileLName.current.value,email:this.profileEmail.current.value};
            updateBackend(params,'profiles',this.myCallback2);
            this.setState({showEditPage:false,imageUrl:this.state.imagePreviewUrl});
        }

    };

    /**
     * Asks other functions to get and set updated profile info
     * @author Noora Turunen
     * @param result: The result from back end
     */
    myCallback2(result){
        this.componentDidMount();
    }

    /**
     * Changes back to normal profile view
     * @author Noora Turunen
     */
    cancel(){
        this.setState({showEditPage:false});
    };
}
export default withTranslation() (Profile);
