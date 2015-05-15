
exports.command = function(name, description, isUnlisted, collaborators, administrators, requiresAdmin, invitations) {
  this
    .verify.elementPresent("form#addCollaboration")


    //.verify.elementPresent("#listedRadioInput")
    /*.verify.elementPresent("#listedRadioTrueInput")
    .verify.elementPresent("#listedRadioFalseInput")*/

    //.verify.elementPresent("#openRadioInput")
    /*.verify.elementPresent("#openRadioTrueInput")
    .verify.elementPresent("#openRadioFalseInput")*/


    if(name){
      this.clearValue("#nameInput")
        .setValue("#nameInput", name)
    }

    if(description){
      this.clearValue("#descriptionInput")
        .setValue("#descriptionInput", description)
    }

    if(typeof isUnlisted === 'boolean' ){
      if(isUnlisted){
        this.click('input[name=isUnlisted][value=true]')
      }else{
        this.click('input[name=isUnlisted][value=false]')
      }
    }

    if(collaborators){
      /*this.clearValue("#collaboratorsInput")
        .setValue("#collaboratorsInput", collaborators)*/
      this.clearValue("#s2id_autogen2")
        .setValue("#s2id_autogen2", collaborators)
        .keys(['\uE004'])  // tab key
    }

    if(administrators){
      /*this.clearValue("#administratorsInput")
        .setValue("#administratorsInput", administrators)*/
      this.clearValue("#s2id_autogen4")
        .setValue("#s2id_autogen4", administrators)
        .keys(['\uE004'])  // tab key
    }

    if(typeof requiresAdmin === 'boolean'){
      if(requiresAdmin){
        this.click('input[name=requiresAdministratorApprovalToJoin][value=false]')
      }else{
        this.click('input[name=requiresAdministratorApprovalToJoin][value=false]')
      }
    }

    if(invitations){
      this.clearValue("#invitationsInput")
        .setValue("#invitationsInput", invitations)
        .keys(['\uE004'])  // tab key
    }

    this.verify.elementPresent("#submitCollaborationButton")
      .verify.elementPresent("#cancelAddCollaborationButton")
      .click("#submitCollaborationButton")

  return this;
};
