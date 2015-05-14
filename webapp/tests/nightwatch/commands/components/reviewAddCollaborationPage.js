exports.command = function(name, description, listed, collaborators, administrators, open, invitations) {
  this

    .verify.elementPresent("form#addCollaboration")

    .verify.elementPresent("#nameInput")
    .verify.elementPresent("#descriptionInput")

    //.verify.elementPresent("#listedRadioInput")
    /*.verify.elementPresent("#listedRadioTrueInput")
    .verify.elementPresent("#listedRadioFalseInput")*/
    //.verify.elementPresent("#collaboratorsInput")
    .verify.elementPresent("#s2id_autogen2")

    //.verify.elementPresent("#administratorsInput")
    .verify.elementPresent("#s2id_autogen4")
    //.verify.elementPresent("#openRadioInput")
    /*.verify.elementPresent("#openRadioTrueInput")
    .verify.elementPresent("#openRadioFalseInput")*/
    //.verify.elementPresent("#invitationsInput")

    .verify.elementPresent(".collaboratorListClass")
    .verify.elementPresent("#submitCollaborationButton")
    .verify.elementPresent("#cancelAddCollaborationButton")

    if(name){
      this.verify.containsText("#nameInput", name)
    }

    if(description){
      this.verify.containsText("#descriptionInput", description)
    }

    if(listed){
      //.verify.containsText("#listedRadioInput", listed)
    }

    if(collaborators){
      //this.verify.containsText("#collaboratorsInput", collaborators)
      this.verify.containsText("#select2-search-choice", collaborators)
    }

    if(administrators){
      //this.verify.containsText("#administratorsInput", administrators)
      this.verify.containsText("#select2-search-choice", administrators)
    }

    if(open){
      //.verify.containsText("#openRadioInput", open)
    }

    if(invitations){

      /*this.verify.containsText("#invitationsInput", invitations)*/
      this.verify.containsText("form#addCollaboration .collaboratorListClass", invitations)
    }


  return this;
};
