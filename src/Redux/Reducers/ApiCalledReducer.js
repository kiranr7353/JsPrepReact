const ApiCalledReducer = (state = false, action) => {

    switch(action.type){
        case 'APICALLED':
            return action.item;
        default:
            return state;
    }
}

export default ApiCalledReducer;