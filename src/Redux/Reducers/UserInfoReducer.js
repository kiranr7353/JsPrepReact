const UserInfoReducer = (state = false, action) => {

    switch(action.type){
        case 'USERINFO':
            return action.item;
        default:
            return state;
    }
}

export default UserInfoReducer;