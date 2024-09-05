const RoleReducer = (state = false, action) => {

    switch(action.type){
        case 'ROLE':
            return action.item;
        default:
            return state;
    }
}

export default RoleReducer;