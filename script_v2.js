void automation.agendar_follow_up_revisao1(Int revisao_id)
{
    // Recuperar o registro de Revisão
    revisao = zoho.crm.getRecordById("Revis_es", revisao_id);
    if (revisao != null)
    {
        // Obter os dados necessários da revisão anterior
        nome_revisao = revisao.get("Name");
        numero_revisao = revisao.get("N_mero_de_Revis_o");

        // Dados de quilometragem e data da última revisão
        km_apos_revisao = ifnull(revisao.get("KM_ap_s_revis_o"), 0).toDecimal();
        km_proxima_revisao = ifnull(revisao.get("KM_Aproximado_Pr_xima_Revis_o"), 0).toDecimal();
        data_revisao_atual = revisao.get("Data_da_ltima_revis_o");

        // Verificar se os campos de quilometragem e datas estão corretos
        info "KM após revisão: " + km_apos_revisao;
        info "KM próxima revisão: " + km_proxima_revisao;
        info "Data revisão atual: " + data_revisao_atual;

        if (data_revisao_atual != null && km_apos_revisao > 0 && km_proxima_revisao > km_apos_revisao)
        {
            // Calcular a quilometragem faltante
            quilometragem_faltante = km_proxima_revisao - km_apos_revisao;

            // Calcular a média de quilometragem mensal diretamente
            media_km_mensal = ifnull(revisao.get("M_dia_KM_Mensal"), 0).toDecimal(); // Usar a média mensal já calculada ou um valor predefinido

            // Se a média mensal não estiver disponível, tentar calcular a média baseada nas quilometragens
            if (media_km_mensal == 0)
            {
                // Calcular a média de KM mensal com base na quilometragem faltante e a data da última revisão
                dias_diferenca = data_revisao_atual.daysBetween(zoho.currentdate); // Usar a diferença de dias entre a revisão e a data atual
                if (dias_diferenca > 0)
                {
                    media_km_mensal = quilometragem_faltante / (dias_diferenca / 30); // Converter a diferença de dias para meses
                }
                else
                {
                    info "Não há tempo suficiente entre as revisões para calcular a média mensal de KM.";
                    media_km_mensal = 0; // Definir para 0 se não houver tempo suficiente
                }
            }

            media_km_mensal = media_km_mensal.round(0); // Arredondar para o valor inteiro mais próximo

            info "Média de KM mensal calculada (arredondada): " + media_km_mensal;

            // Calcular os meses necessários para a quilometragem faltante com a média mensal
            meses_necessarios = (quilometragem_faltante / media_km_mensal).floor();

            // Calcular a data da próxima revisão, com base no número de meses calculado
            proxima_data_revisao = data_revisao_atual.addMonth(meses_necessarios.toLong());

            info "Data da próxima revisão: " + proxima_data_revisao;
        }
        else
        {
            info "Dados insuficientes para o cálculo. Usando data atual para próxima revisão.";
            proxima_data_revisao = zoho.currentdate; // Definir a data de revisão como a data atual
        }

        // Preencher os dados para o novo registro de revisão
        mp = Map();
        mp.put("Name", "Follow UP: " + nome_revisao);
        mp.put("N_mero_de_Revis_o", (numero_revisao.toLong() + 1).toString());
        mp.put("Pr_xima_Revis_o_KM_N", km_apos_revisao + media_km_mensal); // A quilometragem de follow up é incrementada com a média mensal
        mp.put("Pr_ximo_Contato_para_Revis_o", proxima_data_revisao);
        mp.put("M_dia_KM_Mensal", media_km_mensal);

        // Copiar outros dados
        mp.put("Negocia_o_Relacionada", revisao.get("Negocia_o_Relacionada"));
        mp.put("Tipo", revisao.get("Tipo"));
        mp.put("Nome_Contato", revisao.get("Nome_Contato"));
        mp.put("Empresa_Nome", revisao.get("Empresa_Nome"));
        mp.put("Status_da_Revis_o", "Aberto");

        // Criar o novo registro de revisão
        novo_registro = zoho.crm.createRecord("Revis_es", mp);
        info "Novo registro de revisão criado: " + novo_registro;
    }
}
