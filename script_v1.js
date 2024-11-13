// ajustar lógica que usa o campo 'Data_de_Entrega_do_Ve_culo_2' como base para calcular a próxima revisão.
// campo Data da última revisão, api name 'Data_da_ltima_revis_o'

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

            // Obter a data atual e calcular a diferença em meses
            data_atual = zoho.currentdate;
            meses_diferenca = data_revisao_atual.monthsBetween(data_atual);
            
            if (meses_diferenca > 0)
            {
                // Calcular média de KM mensal
                media_km_mensal = quilometragem_faltante / meses_diferenca;
                media_km_mensal = media_km_mensal.round(0);

                info "Média de KM mensal calculada (arredondada): " + media_km_mensal;

                // Calcular os meses e dias necessários para a quilometragem faltante
                meses_necessarios = quilometragem_faltante / media_km_mensal;
                dias_restantes = (quilometragem_faltante % media_km_mensal) / media_km_mensal * 30;

                // Calcular a data da próxima revisão
                proxima_data_revisao = data_atual.addMonth(meses_necessarios.toLong());
                proxima_data_revisao = proxima_data_revisao.addDay(dias_restantes.toLong());

                info "Data da próxima revisão: " + proxima_data_revisao;
            }
            else
            {
                info "Meses de diferença insuficiente para calcular a média de KM mensal.";
                proxima_data_revisao = data_atual;
            }
        }
        else
        {
            info "Dados insuficientes para o cálculo. Usando data atual para próxima revisão.";
            proxima_data_revisao = data_atual;
        }

        // Preencher os dados para o novo registro de revisão
        mp = Map();
        mp.put("Name", "Follow UP: " + nome_revisao);
        mp.put("N_mero_de_Revis_o", (numero_revisao.toLong() + 1).toString());
        mp.put("Pr_xima_Revis_o_KM_N", km_proxima_revisao);
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
