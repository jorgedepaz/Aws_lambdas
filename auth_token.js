module.exports.auth_token = async(event,context)=>{
    
    return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Sistema de control v1.0! ',
        input: event,
      }),
    };
  };
// Help function to generate an IAM policy
const generatePolicy = function(principalId, effect, resource) {
    const authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        "stringKey": "stringval",
        "numberKey": 123,
        "booleanKey": true
    };
    return authResponse;
}
    /*console.log("Hola desde auth_token");
    console.log(req.path);
    console.log(req.methodArn);*/
    /*(async function () {//inicio de la funcion asicrona
    })();//final de la funcion asicrona*/

    /*if (req.path != "/login") {
        if (req.headers.authorization) {//Para verificar que el header este llegando
            if (req.path == "/marca") {
                return true;
            }
            
        }else{ 
            return false;
        }
    }else{
        return true;
    }*/
