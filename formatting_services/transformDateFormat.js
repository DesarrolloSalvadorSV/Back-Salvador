// Transformar la Fecha Recibida
function transformDateCreation(response) {

    // Intentar obtener "created_at" de la respuesta principal
    const timestampInMilliseconds = response.created_at || getCreatedAtDeRelated(response.related);
  
    if (timestampInMilliseconds) {
      transformDate(response, timestampInMilliseconds);
    } else {
      console.error('La respuesta no contiene la propiedad "created_at". No se pudo transformar la fecha.');
    }
  
    return response;
  }
  
  // Intentar obtener "created_at" en la matriz "related"
  function getCreatedAtDeRelated(related) {
   
    if (related && related.length > 0) {
      for (const item of related) {
        if (item.created_at) {
          return item.created_at;
        }
      }
    }
  
    return null;
  }
  
  // Transformar la Fecha al Formato YYYY-MM-DD
  function transformDate(item, timestampInMilliseconds) {
    
    const fechaTransformada = new Date(timestampInMilliseconds);
    item.transformed_date = fechaTransformada.toISOString().split('T')[0]; 

  }
  
  module.exports = {
    transformDateCreation,
  };