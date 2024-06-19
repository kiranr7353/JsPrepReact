const EnableNewDesignReducer = (state = false, action) => {

    switch(action.type){
        case 'NEWDESIGN':
            return action.item;
        default:
            return state;
    }
}

export default EnableNewDesignReducer;