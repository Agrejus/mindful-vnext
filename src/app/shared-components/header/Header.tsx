import React, { useEffect, useState } from 'react';
import './Header.scss';

interface IAuth0Profile {
    iss: string;
    picture: string;
    name: string;
    nickname: string;
    sub: string;
    updated_at: string;
}

interface Props {

}

export const Header: React.FunctionComponent<Props> = (props) => {

    const [profile, setProfile] = useState<IAuth0Profile | null>({} as IAuth0Profile | null);

    useEffect(() => {

        // window.api.receive("profile", (profile) => {
        //     setProfile(profile);
        // });
    });

    const logout = () => {
        //window.api.send("logout");
    }

    const login = () => {

    }

    const getProfile = () => {

        if (profile) {
            return <React.Fragment>
                <img className="gravatar" src={profile?.picture} alt="" title={profile?.iss} />
                <i className="fas fa-sign-out-alt text-success icon-lg clickable header-button fa-padding-fix-lg" onClick={logout}></i>
            </React.Fragment>
        }

        return <i className="fas fa-sign-in-alt text-success icon-lg clickable header-button" onClick={login}></i>
    }

    return (<div id="header-componnent">
        <nav className="navbar navbar-expand-lg" >
            <a className="navbar-brand" href="/">
                <img src="./images/iconfinder_brain-mind-smart-think-intelligence_white.svg" width="40" height="40" className="d-inline-block align-top" alt="" />
                <span>Mindfill</span>
            </a>

            <div className="notification-container notification-container-hidden">

            </div>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <a className="nav-item nav-link" href="#/">Home</a>
                <a className="nav-item nav-link" href="#/dashboard">Dashboard</a>
            </div>
            <div className="actions-container">
                <i className="bi bi-arrow-repeat text-success icon-lg clickable sync header-button rotate"></i>
                <i className="bi bi-bell-fill text-success icon-lg clickable header-button"></i>
                {getProfile()}
            </div>
        </nav>
    </div>
    );
}